namespace ProcessExplorer.Api.Features.ProcessActions;

using System.ComponentModel;
using System.Diagnostics;

// Kết quả kill, để Controller map sang status code.
public enum KillResult
{
    Killed,        // -> 200
    NotFound,      // -> 404 (pid not found / existed)
    AccessDenied,  // -> 403 (protected process, OS rejected)
    Mismatch,      // -> 409 (pid exists, but it belongs to a different process.)
}

public static class ProcessKiller
{
    public static KillResult Kill(int pid, long expectedStartTimeMs)
    {
        Process process;
        try
        {
            process = Process.GetProcessById(pid);
        }
        catch (ArgumentException)
        {
            return KillResult.NotFound;
        }

        using (process)
        {
            long actualStartMs;
            try
            {
                actualStartMs = new DateTimeOffset(process.StartTime).ToUnixTimeMilliseconds();
            }
            catch (Win32Exception)
            {
                return KillResult.AccessDenied;
            }
            Console.WriteLine($"KILL pid={pid} expected={expectedStartTimeMs} actual={actualStartMs}");
            if (actualStartMs != expectedStartTimeMs)
                return KillResult.Mismatch;

            try
            {
                process.Kill();
                return KillResult.Killed;
            }
            catch (Win32Exception)
            {
                return KillResult.AccessDenied;
            }
            catch (InvalidOperationException)
            {
                return KillResult.NotFound;
            }
        }
    }
}