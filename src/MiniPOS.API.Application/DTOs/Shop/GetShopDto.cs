namespace MiniPOS.API.Application.DTOs.Shop
{
    public class GetShopDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string OwnerName { get; set; } = string.Empty;
        public DateTime SubscriptionStartDate { get; set; }
        public DateTime SubscriptionEndDate { get; set; }
        public bool IsActive { get; set; }
    }
}