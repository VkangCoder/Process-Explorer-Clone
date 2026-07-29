namespace ProcessExplorer.Api.Persistence;

using Microsoft.Extensions.Options;
using MongoDB.Driver;

public sealed class ProcessSampleRepository
{
    private readonly IMongoCollection<ProcessSample> _collection;

    public ProcessSampleRepository(IMongoClient client, IOptions<MongoOptions> options)
    {
        var db = client.GetDatabase(options.Value.Database);
        const string collectionName = "process_samples";

        var existing = db.ListCollectionNames().ToList();
        if (!existing.Contains(collectionName))
        {
            db.CreateCollection(collectionName, new CreateCollectionOptions
            {
                TimeSeriesOptions = new TimeSeriesOptions(
                    timeField: "ts",
                    metaField: "meta",
                    granularity: TimeSeriesGranularity.Seconds),
                ExpireAfter = TimeSpan.FromHours(24)
            });
        }

        _collection = db.GetCollection<ProcessSample>(collectionName);
    }

    public Task InsertManyAsync(IReadOnlyList<ProcessSample> samples, CancellationToken ct)
    {
        if (samples.Count == 0) return Task.CompletedTask;
        return _collection.InsertManyAsync(samples, cancellationToken: ct);
    }

    public async Task<List<ProcessSample>> GetHistoryAsync(
    int pid, int minutes, CancellationToken ct)
    {
        DateTime since = DateTime.UtcNow.AddMinutes(-minutes);

        var filter = Builders<ProcessSample>.Filter.And(
            Builders<ProcessSample>.Filter.Eq(s => s.Meta.Pid, pid),
            Builders<ProcessSample>.Filter.Gte(s => s.Timestamp, since)
        );

        return await _collection
            .Find(filter)
            .SortBy(s => s.Timestamp)
            .ToListAsync(ct);
    }
}