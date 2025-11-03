public class ProductDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = default!;
    public string Description { get; set; }
    public decimal Price { get; set; }
    public decimal CostPrice { get; set; }
    public int Quantity { get; set; }
    public bool IsActive { get; set; }
    public string ImageUrl { get; set; }

    public Guid ServiceId { get; set; }
    public string ServiceName { get; set; }

    public Guid? CategoryId { get; set; } // ✅ Add this
    public string CategoryName { get; set; } // ✅ Add this
}
