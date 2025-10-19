namespace MiniPOS.API.Domain
{
    public class Store :BaseEntity
    {
        public string StoreName { get; set; }
        public string StoreType { get; set; }
        public string UserId { get; set; } 

        public IList<Category> Categories { get; set; }
    }
}