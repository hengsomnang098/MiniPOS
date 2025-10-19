using Microsoft.EntityFrameworkCore;

namespace MiniPOS.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options): base(options)
        {

        }

        public DbSet<Store> Stores { get; set; }
        public DbSet<Category> Categories { get; set; }
    }
}