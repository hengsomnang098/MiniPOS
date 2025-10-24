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
        .AddApplicationServices()
        .AddRateLimitingConfiguration()
        .AddSwaggerConfiguration();

    // Add authorization configuration separately to avoid ambiguity
    AuthorizationConfiguration.AddAuthorizationConfiguration(builder.Services);

    builder.Services.AddMemoryCache();


    var app = builder.Build();

    // Configure Serilog request logging
    app.UseSerilogRequestLogging();

    // Configure the HTTP request pipeline.
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "MiniPOS API v1");
        options.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.None);
        
    });

    app.UseHttpsRedirection();
    app.UseRateLimiter();
    app.UseAuthentication();
    app.UseAuthorization();

    try
    {
        // Initialize Database & Seed Data
        await DatabaseInitializer.InitializeAsync(app.Services);
    }
    catch (Exception ex)
    {
        Log.Error(ex, "An error occurred while initializing the database");
        throw;
    }

    app.MapControllers();

    Log.Information("MiniPOS API started successfully");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "MiniPOS API terminated unexpectedly");
    
}
finally
{
    Log.Information("MiniPOS API is shutting down");
    Log.CloseAndFlush();
}


