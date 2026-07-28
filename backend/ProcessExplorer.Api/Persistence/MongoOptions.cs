namespace ProcessExplorer.Api.Persistence;

public sealed class MongoOptions
{
    public required string ConnectionString { get; init; }
    public required string Database { get; init; }
}