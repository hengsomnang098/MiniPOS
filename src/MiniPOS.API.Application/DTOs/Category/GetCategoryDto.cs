namespace MiniPOS.API.Application.DTOs.Category
{
    public class GetCategoryDto
    {
        public Guid Id { get; set; }
        public string CategoryName { get; set; }
        public Guid StoreId { get; set; }

        public string Store { get; set; }

    }
}