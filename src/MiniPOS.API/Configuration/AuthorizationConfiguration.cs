using Microsoft.AspNetCore.Authorization;
using MiniPOS.API.Authorization;
using MiniPOS.API.Domain;

namespace MiniPOS.API.Configuration
{
    public static class AuthorizationConfiguration
    {
        public static IServiceCollection AddAuthorizationConfiguration(this IServiceCollection services)
        {
            services.AddScoped<IAuthorizationHandler, PermissionAuthorizationHandler>();

            services.AddAuthorization(options =>
            {
                // Register a policy provider that will create policies dynamically for each permission
                options.AddPolicy("RequireAdminRole", policy => policy.RequireRole("Super Admin"));

                // Register all permission policies
                foreach (var permission in Permissions.GetAllPermissions())
                {
                    options.AddPolicy(permission, policy =>
                        policy.Requirements.Add(new PermissionRequirement(permission)));
                }
            }); 

            return services;
        }
    }
}