using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace MiniPOS.Data.Seed
{
    public static class IdentitySeeder
    {
        public static async Task SeedAsync(IServiceProvider services)
        {
            var roleManager = services.GetRequiredService<RoleManager<ApplicationRole>>();
            var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
            var db = services.GetRequiredService<ApplicationDbContext>();

            // ✅ 1. Define fixed roles (use stable GUIDs for consistency)
            var roles = new List<ApplicationRole>
            {
                new()
                {
                    Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                    Name = "Super Admin",
                    NormalizedName = "SUPER ADMIN",
                    Description = "Full system access"
                },
                new()
                {
                    Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                    Name = "Staff",
                    NormalizedName = "STAFF",
                    Description = "Limited store management access"
                }
            };

            // ✅ 2. Seed Roles
            foreach (var role in roles)
            {
                if (!await roleManager.Roles.AnyAsync(r => r.Id == role.Id))
                {
                    await roleManager.CreateAsync(role);
                }
            }

            // ✅ 3. Seed Permissions (if empty)
            if (!await db.Permissions.AnyAsync())
            {
                db.Permissions.AddRange(
                    // Users
                    new Permission { Name = "Users.View" },
                    new Permission { Name = "Users.Edit" },
                    new Permission { Name = "Users.Create" },
                    new Permission { Name = "Users.Delete" },

                    // Stores
                    new Permission { Name = "Stores.View" },
                    new Permission { Name = "Stores.Edit" },
                    new Permission { Name = "Stores.Create" },
                    new Permission { Name = "Stores.Delete" },

                    // Categories
                    new Permission { Name = "Categories.View" },
                    new Permission { Name = "Categories.Edit" },
                    new Permission { Name = "Categories.Create" },
                    new Permission { Name = "Categories.Delete" }
                );

                await db.SaveChangesAsync();
            }

            // ✅ 4. Seed RolePermissions
            if (!await db.RolePermissions.AnyAsync())
            {
                var superAdminRole = await roleManager.FindByNameAsync("Super Admin");
                var staffRole = await roleManager.FindByNameAsync("Staff");
                var permissions = await db.Permissions.ToListAsync();
                var rolePermissions = new List<RolePermission>();

                // Super Admin gets all
                if (superAdminRole != null)
                {
                    foreach (var permission in permissions)
                    {
                        rolePermissions.Add(new RolePermission
                        {
                            RoleId = superAdminRole.Id,
                            PermissionId = permission.Id
                        });
                    }
                }

                // Staff gets limited
                if (staffRole != null)
                {
                    var staffPermissionNames = new[] { "Stores.View", "Categories.View" };
                    foreach (var name in staffPermissionNames)
                    {
                        var perm = permissions.FirstOrDefault(p => p.Name == name);
                        if (perm != null)
                        {
                            rolePermissions.Add(new RolePermission
                            {
                                RoleId = staffRole.Id,
                                PermissionId = perm.Id
                            });
                        }
                    }
                }

                db.RolePermissions.AddRange(rolePermissions);
                await db.SaveChangesAsync();
            }

            // ✅ 5. Seed Super Admin user
            var adminEmail = "superadmin@gmail.com";
            var admin = await userManager.FindByEmailAsync(adminEmail);
            var superAdminRoleEntity = await roleManager.FindByNameAsync("Super Admin");

            if (superAdminRoleEntity == null)
                throw new Exception("Super Admin role not found — seeding roles failed.");

            if (admin == null)
            {
                var adminUser = new ApplicationUser
                {
                    Id = Guid.NewGuid(),
                    FullName = "Super Admin",
                    UserName = adminEmail,
                    Email = adminEmail,
                    EmailConfirmed = true,
                    RoleId = superAdminRoleEntity.Id // ✅ Assign directly
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
                // ✅ Ensure role is still linked correctly
                if (admin.RoleId != superAdminRoleEntity.Id)
                {
                    admin.RoleId = superAdminRoleEntity.Id;
                    await userManager.UpdateAsync(admin);
                }
            }

            // ✅ 6. Optional: Add system claims (if needed later)
            // await userManager.AddClaimAsync(admin, new Claim("Permission", "Users.View"));
        }
    }
}
