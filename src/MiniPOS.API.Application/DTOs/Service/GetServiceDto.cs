namespace MiniPOS.API.Application.DTOs.Service
{
    public class GetServiceDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public Guid CategoryId { get; set; }
        public string Category { get; set; }
    }
}