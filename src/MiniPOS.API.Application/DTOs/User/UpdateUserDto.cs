using System.ComponentModel.DataAnnotations;

namespace MiniPOS.API.Application.DTOs.User
{
    public class UpdateUserDto 
    {
        public Guid Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string FullName { get; set; } = string.Empty;
        [Required]
        [EmailAddress]
        [MaxLength(100)]
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        [Required]
        public Guid RoleId { get; set; } 
    }
}