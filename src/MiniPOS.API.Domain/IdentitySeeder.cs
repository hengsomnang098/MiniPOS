
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace MiniPOS.API.Domain
{
    public static class IdentitySeeder
    {
        /// <summary>
        /// Idempotent seeding for roles, permissions, role-permissions and a default super-admin user.
        /// Safe to run multiple times.
        /// </summary>
        public static async Task SeedAsync(IServiceProvider services)
        {
            var roleManager = services.GetRequiredService<RoleManager<ApplicationRole>>();
            var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
            var db = services.GetRequiredService<ApplicationDbContext>();

            // 1. Ensure fixed roles exist (use stable GUIDs to keep consistency)
            var roles = new[]
            {
                new ApplicationRole
                {
                    Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                    Name = "Super Admin",
                    NormalizedName = "SUPER ADMIN",
                    Description = "Full system access"
                },
                new ApplicationRole
                {
                    Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                    Name = "Staff",
                    NormalizedName = "STAFF",
                    Description = "Limited store management access"
                }
            };

            foreach (var role in roles)
            {
                var exists = await roleManager.Roles.AnyAsync(r => r.Id == role.Id || r.NormalizedName == role.NormalizedName);
                if (!exists)
                {
                    var result = await roleManager.CreateAsync(role);
                    if (!result.Succeeded)
                    {
                        var errors = string.Join("; ", result.Errors.Select(e => e.Description));
                        throw new Exception($"Failed to create role '{role.Name}': {errors}");
                    }
                }
            }

            // 2. Define permissions (single source of truth)
            var permissionNames = new[]
            {
                // Categories
                "Categories.View", "Categories.Create", "Categories.Update", "Categories.Delete",

                // Services
                "Services.View", "Services.Create", "Services.Update", "Services.Delete",

                // Users
                "Users.View", "Users.Create", "Users.Update", "Users.Delete",
                // Add more permissions here as needed
                "Roles.View", "Roles.Create", "Roles.Update", "Roles.Delete"
                // Shop
                ,"Shops.View", "Shops.Create", "Shops.Update", "Shops.Delete", "Shops.ViewPage"
                
                 // Products
                ,"Products.View", "Products.Create", "Products.Update", "Products.Delete", "Products.ViewPage"
                
                // Orders
                ,"Orders.View", "Orders.Create", "Orders.Update", "Orders.Delete",
            };

            // Seed permissions if missing
            var existingPermissions = await db.Permissions.Select(p => p.Name).ToListAsync();
            var missing = permissionNames.Except(existingPermissions, StringComparer.OrdinalIgnoreCase).ToList();
            if (missing.Any())
            {
                var toAdd = missing.Select(n => new Permission { Name = n }).ToList();
                await db.Permissions.AddRangeAsync(toAdd);
                await db.SaveChangesAsync();
            }

            // 3. Seed RolePermissions idempotently
            var superAdminRole = await roleManager.FindByNameAsync("Super Admin");
            var staffRole = await roleManager.FindByNameAsync("Staff");
            if (superAdminRole == null || staffRole == null)
            {
                throw new Exception("Roles not found after creation. Aborting seeding.");
            }

            var allPermissions = await db.Permissions.ToListAsync();

            // Helper to add missing role-permissions
            async Task AddMissingRolePermissionsAsync(Guid roleId, IEnumerable<Guid> permissionIds)
            {
                var existing = await db.RolePermissions
                    .Where(rp => rp.RoleId == roleId && permissionIds.Contains(rp.PermissionId))
                    .Select(rp => rp.PermissionId)
                    .ToListAsync();

                var toInsert = permissionIds.Except(existing).Select(pid => new RolePermission { RoleId = roleId, PermissionId = pid });
                if (toInsert.Any())
                {
                    await db.RolePermissions.AddRangeAsync(toInsert);
                }
            }

            // Super Admin gets all permissions
            await AddMissingRolePermissionsAsync(superAdminRole.Id, allPermissions.Select(p => p.Id));

            // Staff gets view access for Stores and Categories
            var staffPermissionIds = allPermissions
                .Where(p => p.Name == "Categories.View" || p.Name == "Services.View" || p.Name == "Shops.View")
                .Select(p => p.Id);

            await AddMissingRolePermissionsAsync(staffRole.Id, staffPermissionIds);

            // Persist any new RolePermissions
            await db.SaveChangesAsync();

            // 4. Seed Super Admin user
            var adminEmail = "superadmin@gmail.com";
            var admin = await userManager.FindByEmailAsync(adminEmail);

            if (admin == null)
            {
                var adminUser = new ApplicationUser
                {
                    Id = Guid.NewGuid(),
                    FullName = "Super Admin",
                    UserName = adminEmail,
                    Email = adminEmail,
                    EmailConfirmed = true,
                    RoleId = superAdminRole.Id
                };

                var createResult = await userManager.CreateAsync(adminUser, "Admin@123");
                if (!createResult.Succeeded)
                {
                    var errors = string.Join("; ", createResult.Errors.Select(e => e.Description));
                    throw new Exception($"Failed to create Super Admin user: {errors}");
                }
            }
            else
            {
                // Ensure RoleId is correct
                if (admin.RoleId != superAdminRole.Id)
                {
                    admin.RoleId = superAdminRole.Id;
                    await userManager.UpdateAsync(admin);
                }
            }
        }
    }
}
