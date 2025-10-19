namespace MiniPOS.DTOs.Store
{
    public class GetStoreDto
    {
        public Guid Id { get; set; }
        public string StoreName { get; set; }
        public string StoreType { get; set; }
        public string UserId { get; set; }
    }
}