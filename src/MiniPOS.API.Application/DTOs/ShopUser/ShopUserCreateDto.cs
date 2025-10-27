namespace MiniPOS.API.Application.DTOs.ShopUser
{
    public class ShopUserCreateDto
    {
        public Guid ShopId { get; set; }
        public Guid[] UserId { get; set; }
    }
}