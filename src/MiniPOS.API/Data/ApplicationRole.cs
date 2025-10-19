using Microsoft.AspNetCore.Identity;

namespace MiniPOS.Data
{
    public class ApplicationRole : IdentityRole<Guid>
    {
        public string Description { get; set; }

        public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
        public ICollection<ApplicationUser> Users { get; set; } = new List<ApplicationUser>();
    }
}