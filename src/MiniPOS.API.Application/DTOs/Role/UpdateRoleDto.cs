using System.ComponentModel.DataAnnotations;

namespace MiniPOS.API.Application.DTOs.Role
{
    public class UpdateRoleDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;
        
        [Required]
        [System.Text.Json.Serialization.JsonPropertyName("permissions")]
        public List<Guid> PermissionIds { get; set; } = new List<Guid>();
    }
}