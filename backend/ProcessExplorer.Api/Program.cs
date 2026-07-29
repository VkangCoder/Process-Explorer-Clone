using Microsoft.OpenApi;
using MongoDB.Driver;
using ProcessExplorer.Api.Features.ProcessMonitoring;
using ProcessExplorer.Api.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<MongoOptions>(builder.Configuration.GetSection("Mongo"));

builder.Services.AddSingleton<IMongoClient>(sp =>
{
    var connectionString = builder.Configuration["Mongo:ConnectionString"];
    return new MongoClient(connectionString);
});

var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
                      policy =>
                      {
                          policy.WithOrigins("http://localhost:3000")
                                .AllowAnyMethod()
                                .AllowAnyHeader()
                                .AllowCredentials();
                      });
});

builder.Services.AddHostedService<ProcessMonitorService>();
builder.Services.AddSingleton<ProcessSampleRepository>();

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Process Explorer",
        Version = "v1",
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var client = scope.ServiceProvider.GetRequiredService<IMongoClient>();
    try
    {
        var dbs = client.ListDatabaseNames().ToList();
        Console.WriteLine($"[Mongo] Kết nối OK. Databases: {string.Join(", ", dbs)}");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[Mongo] KẾT NỐI THẤT BẠI: {ex.Message}");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Process Explorer V1");
    });
}
app.UseCors(MyAllowSpecificOrigins);

app.MapGet("/", () => "Process monitor is running");

app.MapHub<ProcessHub>("/hubs/process");

// app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();