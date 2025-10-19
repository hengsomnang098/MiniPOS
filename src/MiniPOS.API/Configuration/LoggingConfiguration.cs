using Serilog;
using Serilog.Events;

namespace MiniPOS.API.Configuration;

public static class LoggingConfiguration
{
    public static void ConfigureBootstrapLogger()
    {
        Log.Logger = new LoggerConfiguration()
            .MinimumLevel.Information()
            .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}")
            .CreateBootstrapLogger();
    }

    public static IHostBuilder AddSerilogConfiguration(this IHostBuilder host)
    {
        return host.UseSerilog((context, services, configuration) =>
        {
            configuration
                .ReadFrom.Configuration(context.Configuration)
                .ReadFrom.Services(services)
                .Enrich.FromLogContext();
        });
    }

    public static IApplicationBuilder UseSerilogRequestLogging(this IApplicationBuilder app)
    {
        return app.UseSerilogRequestLogging(options =>
        {
            options.MessageTemplate = "Handled {RequestMethod} {RequestPath} responded {StatusCode} in {Elapsed:0.0000} ms";
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