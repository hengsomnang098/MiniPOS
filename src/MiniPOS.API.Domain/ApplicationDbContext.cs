using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace MiniPOS.API.Domain
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, Guid>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // 🧩 DbSets
        public DbSet<Shop> Shops { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Service> Services { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<ShopUser> ShopUsers { get; set; }
        public DbSet<Permission> Permissions { get; set; }
        public DbSet<RolePermission> RolePermissions { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // 🔐 Unique Permission Name
            builder.Entity<Permission>()
                .HasIndex(p => p.Name)
                .IsUnique();

            // 👤 ApplicationUser → ApplicationRole (many-to-1)
            builder.Entity<ApplicationUser>()
                .HasOne(u => u.Role)
                .WithMany(r => r.Users)
                .HasForeignKey(u => u.RoleId)
                .OnDelete(DeleteBehavior.Restrict);

            // 🔐 RolePermission composite key
            builder.Entity<RolePermission>()
                .HasKey(rp => new { rp.RoleId, rp.PermissionId });

            builder.Entity<RolePermission>()
                .HasOne(rp => rp.Role)
                .WithMany(r => r.RolePermissions)
                .HasForeignKey(rp => rp.RoleId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<RolePermission>()
                .HasOne(rp => rp.Permission)
                .WithMany(p => p.RolePermissions)
                .HasForeignKey(rp => rp.PermissionId)
                .OnDelete(DeleteBehavior.Cascade);

            // 🏪 Shop → ApplicationUser (many-to-1)
            builder.Entity<Shop>()
                .HasOne(s => s.User)
                .WithMany(u => u.Shops)
                .HasForeignKey(s => s.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // 🗂️ Category → Shop (many-to-1)
            builder.Entity<Category>()
                .HasOne(c => c.Shop)
                .WithMany(s => s.Categories)
                .HasForeignKey(c => c.ShopId)
                .OnDelete(DeleteBehavior.Cascade);

            // ⚙️ Service → Category (many-to-1)
            builder.Entity<Service>()
                .HasOne(s => s.Category)
                .WithMany(c => c.Services)
                .HasForeignKey(s => s.CategoryId)
                .OnDelete(DeleteBehavior.Cascade);

            // 🛒 Product → Service (many-to-1)
            builder.Entity<Product>()
                .HasOne(p => p.Service)
                .WithMany(s => s.Products)
                .HasForeignKey(p => p.ServiceId)
                .OnDelete(DeleteBehavior.Cascade);

            // 👥 ShopUser composite key
            builder.Entity<ShopUser>()
                .HasKey(su => new { su.ShopId, su.UserId });

            // 👥 ShopUser → Shop (many-to-1)
            builder.Entity<ShopUser>()
                .HasOne(su => su.Shop)
                .WithMany(s => s.ShopUsers)
                .HasForeignKey(su => su.ShopId)
                .OnDelete(DeleteBehavior.Cascade);

            // 👥 ShopUser → User (many-to-1)
            builder.Entity<ShopUser>()
                .HasOne(su => su.User)
                .WithMany(u => u.ShopUsers)
                .HasForeignKey(su => su.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
