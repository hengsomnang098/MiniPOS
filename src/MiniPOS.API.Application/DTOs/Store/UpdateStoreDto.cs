namespace MiniPOS.API.Application.DTOs.Store
{
    public class UpdateStoreDto
    {
        public Guid Id { get; set; }
        public string StoreName { get; set; }
        public string StoreType { get; set; }
    }
}