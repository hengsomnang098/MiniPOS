using Microsoft.AspNetCore.Http;

namespace MiniPOS.API.Application.DTOs.Product
{
    public class ProductUpdateDto
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public decimal CostPrice { get; set; }
       public IFormFile ImageUrl { get; set; }
        public bool IsActive { get; set; }
        public Guid ServiceId { get; set; }
    }
}