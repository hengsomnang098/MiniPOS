namespace MiniPOS.API.Domain
{
    public class Shop : BaseEntity
    {
        public string Name { get; set; }
        public Guid UserId { get; set; } // Owner
        public ApplicationUser User { get; set; }

        public DateTime SubscriptionStartDate { get; set; }
        public DateTime SubscriptionEndDate { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }

        public ICollection<ShopUser> ShopUsers { get; set; } = new List<ShopUser>();

        

    }
}