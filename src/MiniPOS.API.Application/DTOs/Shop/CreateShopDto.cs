using System.ComponentModel.DataAnnotations;

namespace MiniPOS.API.Application.DTOs.Shop
{
    public class CreateShopDto
    {
        [Required(ErrorMessage = "Shop name is required.")]
        [StringLength(100, ErrorMessage = "Shop name cannot exceed 100 characters.")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "User ID is required.")]
        public Guid UserId { get; set; } // Owner ID
        [Required(ErrorMessage = "Location is required.")]
        public DateTime SubscriptionStartDate { get; set; }
        [Required(ErrorMessage = "Subscription end date is required.")]
        public DateTime SubscriptionEndDate { get; set; }

        [Required(ErrorMessage = "IsActive is required.")]
        public bool IsActive { get; set; }
    }
}