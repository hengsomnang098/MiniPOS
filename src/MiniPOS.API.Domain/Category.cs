namespace MiniPOS.API.Domain
{
    public class Category :BaseEntity
    {
        public string CategoryName { get; set; }

        public Guid StoreId { get; set; }

        public Store Store { get; set; }
    }
}