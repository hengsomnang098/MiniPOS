using System.ComponentModel.DataAnnotations;

namespace MiniPOS.DTOs.Category
{
    public class UpdateCategoryDto : CreateCategoryDto
    {
        [Required]
        public Guid Id { get; set; }
    }
}