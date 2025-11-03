using Microsoft.AspNetCore.Identity;

namespace MiniPOS.API.Domain
{
    public class ApplicationUser : IdentityUser<Guid>
    {
        public string FullName { get; set; } = string.Empty;

        public Guid RoleId { get; set; }
        public ApplicationRole Role { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public ICollection<Shop> Shops { get; set; } = new List<Shop>();
        public ICollection<ShopUser> ShopUsers { get; set; } = new List<ShopUser>();
    }
}