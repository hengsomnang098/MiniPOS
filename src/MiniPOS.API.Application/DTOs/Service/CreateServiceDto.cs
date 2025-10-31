using System.ComponentModel.DataAnnotations;

namespace MiniPOS.API.Application.DTOs.Service
{
    public class CreateServiceDto
    {
        [Required(ErrorMessage = "Service name is required.")]
        [StringLength(50, ErrorMessage = "Service name cannot exceed 50 characters.")]
        public string Name { get; set; }

        [Required(ErrorMessage = "Category ID is required.")]
        public Guid CategoryId { get; set; }
    }
}