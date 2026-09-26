namespace ProcessExplorer.Api.Interop;

using System.ComponentModel;
using System.Runtime.InteropServices;
using System.Security;
using System.Security.Principal;

static class ProcessOwnerNative
{
    const uint PROCESS_QUERY_LIMITED_INFORMATION = 0x1000;
    const uint TOKEN_QUERY = 0x0008;

    [DllImport("kernel32.dll", SetLastError = true)]
    static extern IntPtr OpenProcess(uint dwDesiredAccess, bool bInheritHandle, uint dwProcessId);

    [DllImport("kernel32.dll", SetLastError = true)]
    static extern bool CloseHandle(IntPtr hObject);

    [DllImport("advapi32.dll", SetLastError = true)]
    static extern bool OpenProcessToken(IntPtr ProcessHandle, uint DesiredAccess, out IntPtr TokenHandle);

    // Best-effort "DOMAIN\user" of the process token owner. Null when access is denied
    // (protected/elevated processes when running unelevated) or the process has exited.
    public static string? GetOwner(int pid)
    {
        IntPtr process = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, (uint)pid);
        if (process == IntPtr.Zero)
            return null;

        try
        {
            if (!OpenProcessToken(process, TOKEN_QUERY, out IntPtr token))
                return null;

            try
            {
                using var identity = new WindowsIdentity(token);
                return identity.Name;
            }
            finally
            {
                CloseHandle(token);
            }
        }
        catch (Exception ex) when (ex is UnauthorizedAccessException or Win32Exception or SecurityException)
        {
            return null;
        }
        finally
        {
            CloseHandle(process);
        }
    }
}
