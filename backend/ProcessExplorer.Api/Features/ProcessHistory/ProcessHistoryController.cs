namespace ProcessExplorer.Api.Features.ProcessHistory;

using Microsoft.AspNetCore.Mvc;
using ProcessExplorer.Api.Persistence;

[ApiController]
[Route("api/processes")]
public class ProcessHistoryController : ControllerBase
{
    private readonly ProcessSampleRepository _repository;

    public ProcessHistoryController(ProcessSampleRepository repository)
    {
        _repository = repository;
    }

    // GET /api/processes/1080/history?minutes=5
     [HttpGet("{pid:int}/history")]
    public async Task<IActionResult> GetHistory(
        int pid,
        [FromQuery] int seconds = 60,
        CancellationToken ct = default)
    {
        var samples = await _repository.GetHistoryAsync(pid, seconds, ct);

        var points = samples.Select(s => new
        {
            timestamp = s.Timestamp,
            cpu = s.Cpu,
            memMb = s.MemMb,
            handleCount = s.HandleCount,
        });

        return Ok(points);
    }
}