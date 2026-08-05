using System.Text;
using Microsoft.OpenApi;
using MongoDB.Driver;
using ProcessExplorer.Api.Auth;
using ProcessExplorer.Api.Features.ProcessMonitoring;
using ProcessExplorer.Api.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));
var jwtConfig = builder.Configuration.GetSection("Jwt").Get<JwtOptions>()!;
var keyBytes = Encoding.UTF8.GetBytes(jwtConfig.SecretKey);
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtConfig.Issuer,

            ValidateAudience = true,
            ValidAudience = jwtConfig.Audience,

            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(keyBytes),

            ClockSkew = TimeSpan.Zero,
        };
    });

builder.Services.AddAuthorization();

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

app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/", () => "Process monitor is running");

app.MapHub<ProcessHub>("/hubs/process");

// app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();