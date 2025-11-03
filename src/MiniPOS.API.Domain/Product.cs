namespace MiniPOS.API.Domain
{
    public class Product : BaseEntity
    {
        // Basic info
        public string Name { get; set; }
        public string Description { get; set; }

        // Inventory
        public int Quantity { get; set; }
        public decimal Price { get; set; }        
        
        public decimal CostPrice { get; set; } 


        public Guid? ServiceId { get; set; }       
        public Service Service { get; set; }

        public string ImageUrl { get; set; }    
        public bool IsActive { get; set; } = true;

    }
}
