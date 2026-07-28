using Microsoft.OpenApi;
using ProcessExplorer.Api.Features.ProcessMonitoring;

var builder = WebApplication.CreateBuilder(args);

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