namespace MiniPOS.API.Domain
{
    public class Product : BaseEntity
    {
        // Basic info
        public string Name { get; set; }
        public string Description { get; set; }
        // Barcode (EAN/UPC/QR text) — optional but unique when provided
        public string Barcode { get; set; }

        // Inventory
        public int Quantity { get; set; }
        public decimal Price { get; set; }        
        
        public decimal CostPrice { get; set; } 

        // Scope
        // Denormalized for performance and to enforce per-shop uniqueness of Barcode
        public Guid ShopId { get; set; }
        public Shop Shop { get; set; }

        public Guid? ServiceId { get; set; }       
        public Service Service { get; set; }

        public string ImageUrl { get; set; }    
        public bool IsActive { get; set; } = true;

    }
}
