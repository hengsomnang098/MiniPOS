using System.ComponentModel.DataAnnotations;

namespace MiniPOS.API.Application.DTOs.Category
{
    public class CreateCategoryDto
    {
        [Required]
        [MaxLength(100)]
        public string CategoryName { get; set; }

        [Required]
        public Guid ShopId { get; set; }
    }
}