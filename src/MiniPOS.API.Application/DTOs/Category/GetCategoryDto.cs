namespace MiniPOS.API.Application.DTOs.Category
{
    public class GetCategoryDto
    {
        public Guid Id { get; set; }
        public string CategoryName { get; set; }
        public Guid ShopId { get; set; }

        public string Shop { get; set; }

    }
}