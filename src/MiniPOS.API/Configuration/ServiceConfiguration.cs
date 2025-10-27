using MiniPOS.API.Application;
using MiniPOS.API.Application.Contracts;
using MiniPOS.API.Application.Services;

namespace MiniPOS.API.Configuration;

public static class ServiceConfiguration
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Controller Configuration
        services.AddControllers()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.ReferenceHandler =
                    System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
            });

        // Auto Mapper Configuration
        services.AddAutoMapper(cfg =>
        {
            cfg.AddProfile<MappingProfiles>();
        });

        // Dependency Injection Configuration
        services.AddScoped<IAuthRepository, AuthRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IRoleRepository, RoleRepository>();
        services.AddScoped<IShopRepository, ShopRepository>();
        services.AddScoped<IShopUserRepository, ShopUserRepository>();

        return services;
    }
}