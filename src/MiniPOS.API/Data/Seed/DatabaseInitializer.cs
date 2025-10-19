using Microsoft.EntityFrameworkCore;

namespace MiniPOS.Data.Seed
{
    public class DatabaseInitializer
    {
        public static async Task InitializeAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            try
            {
                if (!db.Database.CanConnect())
                {
                    Console.ForegroundColor = ConsoleColor.Yellow;
                    Console.WriteLine("⚠️ Database not found — creating new database...");
                    Console.ResetColor();
                    db.Database.Migrate();
                }
                else
                {
                    var pending = db.Database.GetPendingMigrations();
                    if (pending.Any())
                    {
                        Console.ForegroundColor = ConsoleColor.Cyan;
                        Console.WriteLine($"⚙️ Applying {pending.Count()} pending migrations...");
                        Console.ResetColor();
                        db.Database.Migrate();
                    }
                    else
                    {
                        Console.ForegroundColor = ConsoleColor.Green;
                        Console.WriteLine("✅ Database is up to date.");
                        Console.ResetColor();
                    }
                }

                 // ✅ Seed Identity roles, users, permissions
                await IdentitySeeder.SeedAsync(scope.ServiceProvider);
            }
            catch (Exception ex)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine($"❌ Database initialization failed: {ex.Message}");
                Console.ResetColor();
            }
        }
    }
}