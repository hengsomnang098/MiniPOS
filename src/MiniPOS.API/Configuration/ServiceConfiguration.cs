using Microsoft.Extensions.Configuration;
using MiniPOS.API.Application;
using MiniPOS.API.Application.Config;
using MiniPOS.API.Application.Contracts;
using MiniPOS.API.Application.Repository;
using MiniPOS.API.Application.Services;

namespace MiniPOS.API.Configuration
{
    public static class ServiceConfiguration
    {
        public static IServiceCollection AddApplicationServices(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            // 🧩 Controller Configuration
            services.AddControllers()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.ReferenceHandler =
                        System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
                });

            // 🧩 AutoMapper Configuration
            services.AddAutoMapper(cfg =>
            {
                cfg.AddProfile<MappingProfiles>();
            });

            // 🧩 Dependency Injection Configuration
            services.AddScoped<IAuthRepository, AuthRepository>();
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IRoleRepository, RoleRepository>();
            services.AddScoped<IShopRepository, ShopRepository>();
            services.AddScoped<IShopUserRepository, ShopUserRepository>();
            services.AddScoped<ICategoryRepository, CategoryRepository>();
            services.AddScoped<IServiceRepository, ServiceRepository>();
            services.AddScoped<IProductRepository, ProductRepository>();

            // 🪄 BunnyCDN Configuration
            services.Configure<BunnyCdnOptions>(configuration.GetSection("BunnyCdn"));

            // Register BunnyCdnOptions as singleton for direct DI
            var bunnyOptions = configuration.GetSection("BunnyCdn").Get<BunnyCdnOptions>() ?? new BunnyCdnOptions();
            services.AddSingleton(bunnyOptions);

            // Register BunnyCdnService (typed HttpClient)
            services.AddHttpClient<IFileUploadService, BunnyCdnService>();

            return services;
        }
    }
}
