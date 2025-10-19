using Microsoft.AspNetCore.Identity;

namespace MiniPOS.Data
{
    public class ApplicationUser : IdentityUser<Guid>
    {
        public string FullName { get; set; } = string.Empty;

        // ✅ Foreign key link to role
        public Guid RoleId { get; set; }
        public ApplicationRole Role { get; set; }


    }
}