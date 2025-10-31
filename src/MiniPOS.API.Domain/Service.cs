namespace MiniPOS.API.Domain
{
    public class Service : BaseEntity
    {
        public string Name { get; set; }

        public Guid CategoryId { get; set; }
        public Category Category { get; set; }
    }
}