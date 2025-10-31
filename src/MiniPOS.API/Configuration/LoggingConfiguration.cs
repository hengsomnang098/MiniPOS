using Serilog;
using Serilog.Events;
using Serilog.Sinks.SystemConsole.Themes;


namespace MiniPOS.API.Configuration
{
    public static class LoggingConfiguration
    {
        public static void ConfigureBootstrapLogger()
        {
            // 🔥 Ensure logs folder exists even before full config is loaded
            Directory.CreateDirectory("logs");

            Log.Logger = new LoggerConfiguration()
                .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
                .MinimumLevel.Override("System", LogEventLevel.Warning)
                .MinimumLevel.Information()
                .Enrich.FromLogContext()
                .WriteTo.Console(
                    theme: AnsiConsoleTheme.Code,
                    outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}"
                )
                // 📝 Write bootstrap logs too (useful if app crashes before config load)
                .WriteTo.File(
                    path: "logs/bootstrap-.log",
                    rollingInterval: RollingInterval.Day,
                    retainedFileCountLimit: 7,
                    shared: true,
                    outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj}{NewLine}{Exception}"
                )
                .CreateBootstrapLogger();
        }

        public static IHostBuilder AddSerilogConfiguration(this IHostBuilder host)
        {
            return host.UseSerilog((context, services, configuration) =>
            {
                // ✅ Ensure logs folder always exists
                Directory.CreateDirectory("logs");

                configuration
                    .ReadFrom.Configuration(context.Configuration)
                    .ReadFrom.Services(services)
                    .Enrich.FromLogContext()
                    .WriteTo.File(
                        path: "logs/minipos-dev-.log",
                        rollingInterval: RollingInterval.Day,
                        retainedFileCountLimit: 30,
                        shared: true,
                        restrictedToMinimumLevel: LogEventLevel.Information,
                        outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {SourceContext} {Message:lj}{NewLine}{Exception}"
                    );
            });
        }

        public static IApplicationBuilder UseSerilogRequestLogging(this IApplicationBuilder app)
        {
            return app.UseSerilogRequestLogging(options =>
            {
                options.MessageTemplate =
                    "Handled {RequestMethod} {RequestPath} responded {StatusCode} in {Elapsed:0.0000} ms";

                options.GetLevel = (httpContext, elapsed, ex) => ex != null
                    ? LogEventLevel.Error
                    : httpContext.Response.StatusCode > 499
                        ? LogEventLevel.Error
                        : LogEventLevel.Information;

                options.EnrichDiagnosticContext = (diagnosticContext, httpContext) =>
                {
                    diagnosticContext.Set("RequestHost", httpContext.Request.Host.Value);
                    diagnosticContext.Set("RequestScheme", httpContext.Request.Scheme);
                    diagnosticContext.Set("UserAgent", httpContext.Request.Headers["User-Agent"].FirstOrDefault());
                    diagnosticContext.Set("UserName", httpContext.User?.Identity?.Name);
                };
            });
        }
    }
}
