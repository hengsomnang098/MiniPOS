namespace MiniPOS.API.Domain
{
    public class Category :BaseEntity
    {
        public string CategoryName { get; set; }

        public Guid ShopId { get; set; }
        public Shop Shop { get; set; }

        public ICollection<Service> Services { get; set; } = new List<Service>();

    }
}