namespace ProcessExplorer.Api.Interop;

using System.Runtime.InteropServices;

static class ServiceNative
{
    const uint SC_MANAGER_ENUMERATE_SERVICE = 0x0004;
    const uint SERVICE_WIN32 = 0x00000030; // OWN_PROCESS | SHARE_PROCESS
    const uint SERVICE_STATE_ALL = 0x00000003;
    const int SC_ENUM_PROCESS_INFO = 0;

    [StructLayout(LayoutKind.Sequential)]
    struct SERVICE_STATUS_PROCESS
    {
        public uint dwServiceType;
        public uint dwCurrentState;
        public uint dwControlsAccepted;
        public uint dwWin32ExitCode;
        public uint dwServiceSpecificExitCode;
        public uint dwCheckPoint;
        public uint dwWaitHint;
        public uint dwProcessId;
        public uint dwServiceFlags;
    }

    [StructLayout(LayoutKind.Sequential)]
    struct ENUM_SERVICE_STATUS_PROCESS
    {
        public IntPtr lpServiceName;
        public IntPtr lpDisplayName;
        public SERVICE_STATUS_PROCESS ServiceStatusProcess;
    }

    [DllImport("advapi32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
    static extern IntPtr OpenSCManagerW(string? lpMachineName, string? lpDatabaseName, uint dwDesiredAccess);

    [DllImport("advapi32.dll", SetLastError = true)]
    static extern bool CloseServiceHandle(IntPtr hSCObject);

    [DllImport("advapi32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
    static extern bool EnumServicesStatusExW(
        IntPtr hSCManager,
        int InfoLevel,
        uint dwServiceType,
        uint dwServiceState,
        IntPtr lpServices,
        uint cbBufSize,
        out uint pcbBytesNeeded,
        out uint lpServicesReturned,
        ref uint lpResumeHandle,
        string? pszGroupName);

    // Returns the set of PIDs currently hosting a Windows service (SCM-registered).
    public static HashSet<int> GetServicePids()
    {
        var pids = new HashSet<int>();
        IntPtr scm = OpenSCManagerW(null, null, SC_MANAGER_ENUMERATE_SERVICE);
        if (scm == IntPtr.Zero)
            return pids;

        try
        {
            uint resumeHandle = 0;

            // First call: ask for the required buffer size.
            EnumServicesStatusExW(scm, SC_ENUM_PROCESS_INFO, SERVICE_WIN32, SERVICE_STATE_ALL,
                IntPtr.Zero, 0, out uint bytesNeeded, out uint servicesReturned, ref resumeHandle, null);

            if (bytesNeeded == 0)
                return pids;

            IntPtr buffer = Marshal.AllocHGlobal((int)bytesNeeded);
            try
            {
                bool ok = EnumServicesStatusExW(scm, SC_ENUM_PROCESS_INFO, SERVICE_WIN32, SERVICE_STATE_ALL,
                    buffer, bytesNeeded, out bytesNeeded, out servicesReturned, ref resumeHandle, null);

                if (!ok)
                    return pids;

                int structSize = Marshal.SizeOf<ENUM_SERVICE_STATUS_PROCESS>();
                for (int i = 0; i < servicesReturned; i++)
                {
                    IntPtr entryPtr = IntPtr.Add(buffer, i * structSize);
                    var entry = Marshal.PtrToStructure<ENUM_SERVICE_STATUS_PROCESS>(entryPtr);
                    if (entry.ServiceStatusProcess.dwProcessId != 0)
                        pids.Add((int)entry.ServiceStatusProcess.dwProcessId);
                }
            }
            finally
            {
                Marshal.FreeHGlobal(buffer);
            }
        }
        finally
        {
            CloseServiceHandle(scm);
        }

        return pids;
    }
}
