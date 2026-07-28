namespace ProcessExplorer.Api.Features.ProcessActions;

using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/processes")]
public class ProcessActionsController : ControllerBase
{
    [HttpPost("{pid:int}/kill")]
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
}

public record KillRequest(long StartTimeUnixMs);