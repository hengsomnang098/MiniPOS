using System.ComponentModel.DataAnnotations;

namespace MiniPOS.API.Application.DTOs.Role
{
    public class CreateRoleDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        public Guid[] PermissionIds { get; set; }  
    }
}