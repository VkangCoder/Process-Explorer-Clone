namespace ProcessExplorer.Api.Features.ProcessActions;

using System.Collections.Concurrent;
using System.Drawing;
using System.Drawing.Imaging;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/processes")]
public class ProcessActionsController : ControllerBase
{
    private static readonly ConcurrentDictionary<string, byte[]> _iconCache = new();

    [HttpPost("{pid:int}/kill")]
    [Authorize]
    public IActionResult Kill(int pid, [FromBody] KillRequest request)
    {
        KillResult result = ProcessKiller.Kill(pid, request.StartTimeUnixMs);

        return result switch
        {
            KillResult.Killed => NoContent(),                          // 204
            KillResult.NotFound => NotFound(new { message = "Process does not exist" }),        // 404
            KillResult.AccessDenied => StatusCode(403, new { message = "No permission to kill this process." }), // 403
            KillResult.Mismatch => Conflict(new { message = "PID already belongs to another process" }), // 409
            _ => StatusCode(500),
        };
    }

    [HttpGet("icon")]
    public IActionResult GetIcon([FromQuery] string path)
    {
        if (string.IsNullOrWhiteSpace(path) || !System.IO.File.Exists(path))
            return NotFound();

        if (_iconCache.TryGetValue(path, out byte[]? cached))
            return File(cached, "image/png");

        try
        {
            using Icon? icon = Icon.ExtractAssociatedIcon(path);
            if (icon is null) return NotFound();

            using Bitmap bitmap = icon.ToBitmap();
            using var ms = new MemoryStream();
            bitmap.Save(ms, ImageFormat.Png);
            byte[] bytes = ms.ToArray();

            _iconCache[path] = bytes;
            return File(bytes, "image/png");
        }
        catch (Exception ex) when (
            ex is ArgumentException
                or PlatformNotSupportedException
                or IOException
                or UnauthorizedAccessException)
        {
            // Best-effort: không lấy được icon vì bất kỳ lý do gì (không quyền,
            // file bị khoá, không có icon resource...) -> coi như "không có icon".
            return NotFound();
        }
    }
}

public record KillRequest(long StartTimeUnixMs);