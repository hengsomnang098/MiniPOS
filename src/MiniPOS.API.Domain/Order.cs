namespace MiniPOS.API.Domain
{
    public class Order : BaseEntity
    {
        public Guid ShopId { get; set; }
        public Shop Shop { get; set; }

        // Customer is optional for walk-in sales
        public Guid? CustomerId { get; set; }
        public ApplicationUser Customer { get; set; }

        public decimal TotalAmount { get; set; }
        public decimal Discount { get; set; }
        public decimal FinalAmount { get; set; }

        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
        public string Status { get; set; } = "Completed"; // Pending, Completed, Cancelled

        public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    }
}