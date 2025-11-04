namespace MiniPOS.API.Application.DTOs.Order
{
    public class OrderCreateDto
    {
        public Guid ShopId { get; set; }
        public List<OrderItemCreateDto> Items { get; set; } = new();
        public decimal Discount { get; set; }
    }
}