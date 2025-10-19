using System.ComponentModel.DataAnnotations;

namespace MiniPOS.API.Application.DTOs.Category
{
    public class UpdateCategoryDto : CreateCategoryDto
    {
        [Required]
        public Guid Id { get; set; }
    }
}