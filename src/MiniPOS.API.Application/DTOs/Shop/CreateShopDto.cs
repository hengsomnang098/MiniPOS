using System.ComponentModel.DataAnnotations;

namespace MiniPOS.API.Application.DTOs.Shop
{
    public class CreateShopDto
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public Guid UserId { get; set; } // Owner ID
    }
}