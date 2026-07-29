namespace ProcessExplorer.Api.Persistence;

using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

public sealed class ProcessSample
{
    [BsonId]
    public ObjectId Id { get; set; }

    [BsonElement("ts")]
    public DateTime Timestamp { get; set; }   // timeField

    [BsonElement("meta")]
    public required SampleMeta Meta { get; set; }  // metaField (pid + name)

    [BsonElement("cpu")]
    public double Cpu { get; set; }

    [BsonElement("mem")]
    public long MemMb { get; set; }

    [BsonElement("handles")]
    public int HandleCount { get; set; }
}

public sealed class SampleMeta
{
    [BsonElement("pid")]
    public int Pid { get; set; }

    [BsonElement("name")]
    public required string Name { get; set; }
}