using System.ComponentModel.DataAnnotations;

namespace MiniPOS.API.Application.DTOs.Shop
{
    public class UpdateShopDto
    {
        public Guid Id { get; set; }
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public Guid UserId { get; set; } // Owner ID
        public DateTime SubscriptionStartDate { get; set; }
        public DateTime SubscriptionEndDate { get; set; }

        [Required]
        public bool IsActive { get; set; }
    }
}