using System.ComponentModel.DataAnnotations;

namespace MiniPOS.API.Application.DTOs.User
{
    public class CreateUserDto
    {
        [Required]
        [MaxLength(50)]
        public string FullName { get; set; } = string.Empty;
        [Required]
        [EmailAddress]
        [MaxLength(100)]
        public string Email { get; set; } = string.Empty;
        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;
        [Required]
        public Guid RoleId { get; set; } 
    }
}