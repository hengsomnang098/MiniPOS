namespace MiniPOS.API.Application.DTOs.ShopUser
{
    public class ShopUserDto
    {
        public Guid Id { get; set; }
        public Guid ShopId { get; set; }
        public string Shop { get; set; }
        public Guid UserId { get; set; }
        public string User { get; set; }
    }
}