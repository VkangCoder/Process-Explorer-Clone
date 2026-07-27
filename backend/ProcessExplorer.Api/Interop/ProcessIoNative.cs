namespace ProcessExplorer.Api.Interop;

using System.Runtime.InteropServices;

static class ProcessIoNative
{
    [StructLayout(LayoutKind.Sequential)]
    struct IO_COUNTERS
    {
        public ulong ReadOperationCount;
        public ulong WriteOperationCount;
        public ulong OtherOperationCount;
        public ulong ReadTransferCount;
        public ulong WriteTransferCount;
        public ulong OtherTransferCount;
    }

    const uint PROCESS_QUERY_INFORMATION = 0x0400;
    const uint PROCESS_QUERY_LIMITED_INFORMATION = 0x1000;

    static readonly IntPtr InvalidHandle = IntPtr.Zero;

    [DllImport("kernel32.dll", SetLastError = true)]
    static extern IntPtr OpenProcess(uint dwDesiredAccess, bool bInheritHandle, uint dwProcessId);

    [DllImport("kernel32.dll", SetLastError = true)]
    static extern bool GetProcessIoCounters(IntPtr hProcess, out IO_COUNTERS lpIoCounters);

    [DllImport("kernel32.dll", SetLastError = true)]
    static extern bool CloseHandle(IntPtr hObject);

    public static long GetTotalIoBytes(int pid)
    {
        IntPtr handle = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, (uint)pid);
        if (handle == InvalidHandle)
            return -1;

        try
        {
            if (!GetProcessIoCounters(handle, out IO_COUNTERS counters))
                return -1;

            return (long)(counters.ReadTransferCount + counters.WriteTransferCount);
        }
        finally
        {
            CloseHandle(handle);
        }
    }
}