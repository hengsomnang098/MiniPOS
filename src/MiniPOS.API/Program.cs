using MiniPOS.API.Application.Config;
using MiniPOS.API.Configuration;
using MiniPOS.API.Domain;
using Serilog;

// ✅ Ensure working directory is consistent across environments (esp. EF & Linux)
Directory.SetCurrentDirectory(AppContext.BaseDirectory);

// ✅ Ensure logs folder exists early to avoid Serilog file sink crash
var logDirectory = Path.Combine(AppContext.BaseDirectory, "logs");
Directory.CreateDirectory(logDirectory);

// ✅ Configure minimal bootstrap logger for startup (writes to console + bootstrap log)
LoggingConfiguration.ConfigureBootstrapLogger();

try
{
    Log.Information("🚀 Starting MiniPOS API application");

    var builder = WebApplication.CreateBuilder(args);

    // ✅ Load full Serilog config (from appsettings.json)
    builder.Host.AddSerilogConfiguration();

    // BunnyCDN Configuration
    builder.Services.Configure<BunnyCdnOptions>(builder.Configuration.GetSection("BunnyCdn"));

    // ✅ Register core services
    builder.Services
        .AddDatabaseConfiguration(builder.Configuration)
        .AddAuthenticationConfiguration(builder.Configuration)
        .AddApplicationServices(builder.Configuration) // 👈 pass configuration here
        .AddRateLimitingConfiguration()
        .AddSwaggerConfiguration();



    // ✅ Authorization config (clean separation)
    AuthorizationConfiguration.AddAuthorizationConfiguration(builder.Services);

    // ✅ Add in-memory cache
    builder.Services.AddMemoryCache();

    // ✅ Kestrel tuning (for high load scenarios)
    builder.WebHost.ConfigureKestrel(options =>
    {
        options.Limits.MaxConcurrentConnections = 10_000;
        options.Limits.MaxConcurrentUpgradedConnections = 10_000;
        options.Limits.MaxRequestBodySize = 10 * 1024 * 1024; // 10 MB
        options.AddServerHeader = false; // Hide server signature
    });

    var app = builder.Build();

    // ✅ Request logging middleware (Serilog)
    app.UseSerilogRequestLogging();

    // ✅ Swagger UI always enabled (good for local & test)
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

    // ✅ Prevent EF design-time host from executing full app startup
    var isEfMigrations = app.Environment.IsEnvironment("EFMigrations");
    if (!isEfMigrations)
    {
        try
        {
            Log.Information("🔧 Initializing database...");
            await DatabaseInitializer.InitializeAsync(app.Services);
            Log.Information("✅ Database initialization completed");
        }
        catch (Exception ex)
        {
            Log.Error(ex, "❌ Error occurred while initializing the database");
            throw;
        }

        app.MapControllers();

        Log.Information("✅ MiniPOS API started successfully and is ready to accept requests.");
        app.Run();
    }
    else
    {
        Log.Information("🧱 EF Migrations environment detected — skipping full startup.");
    }
}
catch (Exception ex)
{
    Log.Fatal(ex, "💥 MiniPOS API terminated unexpectedly");
}
finally
{
    Log.Information("🛑 MiniPOS API shutting down...");
    Log.CloseAndFlush();
}
