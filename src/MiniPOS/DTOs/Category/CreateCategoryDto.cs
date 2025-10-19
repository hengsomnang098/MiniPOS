namespace MiniPOS.DTOs.Category
{
    public class CreateCategoryDto
    {
        public string CategoryName { get; set; }
        public Guid StoreId { get; set; }
    }
}