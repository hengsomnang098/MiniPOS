

using System.ComponentModel.DataAnnotations;

namespace MiniPOS.DTOs.Store
{
    public class CreateStoreDto
    {
        [Required]
        [MaxLength(100)]
        public string StoreName { get; set; }
        [Required]
        [MaxLength(50)]
        public string StoreType { get; set; }
        [Required]
        public string UserId { get; set; }
    }
}