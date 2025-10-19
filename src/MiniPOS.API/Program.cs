using MiniPOS.API.Configuration;
using MiniPOS.API.Domain;
using Serilog;

// Configure minimal bootstrap logger for startup only
LoggingConfiguration.ConfigureBootstrapLogger();

try
{
    Log.Information("Starting MiniPOS API application");

    var builder = WebApplication.CreateBuilder(args);

    // Replace the bootstrap logger with the full configuration from appsettings
    builder.Host.AddSerilogConfiguration();

    // Add services to the container.
    builder.Services
        .AddDatabaseConfiguration(builder.Configuration)
        .AddAuthenticationConfiguration(builder.Configuration)
        .AddAuthorizationConfiguration()
        .AddApplicationServices()
        .AddRateLimitingConfiguration()
        .AddSwaggerConfiguration();

    var app = builder.Build();

    // Configure Serilog request logging
    app.UseSerilogRequestLogging();

    // Configure the HTTP request pipeline.
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    app.UseHttpsRedirection();
    app.UseRateLimiter();
    app.UseAuthentication();
    app.UseAuthorization();

    // Initialize Database & Seed Data
    await DatabaseInitializer.InitializeAsync(app.Services);

    app.MapControllers();

    Log.Information("MiniPOS API started successfully");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "MiniPOS API terminated unexpectedly");
    throw;
}
finally
{
    Log.Information("MiniPOS API is shutting down");
    Log.CloseAndFlush();
}


