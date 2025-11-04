using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using MiniPOS.API.Application.Contracts;
using MiniPOS.API.Application.DTOs.Product;
using MiniPOS.API.Authorization;
using MiniPOS.API.Common.Constants;
using MiniPOS.API.Common.Results;

namespace MiniPOS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // → /api/Product
    [EnableRateLimiting(RateLimitingConstants.PerUserPolicy)]
    [Authorize]
    public class ProductController : BaseApiController
    {
        private readonly IProductRepository _productRepository;
        private readonly ILogger<ProductController> _logger;

        public ProductController(IProductRepository productRepository, ILogger<ProductController> logger)
        {
            _productRepository = productRepository;
            _logger = logger;
        }

        // ➕ POST: /api/Product
        [HttpPost]
        [HasPermission(Permissions.Products.Create)]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<ProductDto>> Create([FromForm] ProductCreateDto dto)
        {
            _logger.LogInformation("🚀 Received Create Product request: {@Dto}", dto);

            if (!ModelState.IsValid)
            {
                _logger.LogWarning("❌ ModelState invalid: {@Errors}", ModelState.Values.SelectMany(v => v.Errors));
                return BadRequest(ModelState);
            }

            var result = await _productRepository.CreateAsync(dto);
            return ToActionResult(result);
        }

        // ✏️ PUT: /api/Product/{id}
        [HttpPut("{id:guid}")]
        [HasPermission(Permissions.Products.Update)]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<ProductDto>> Update(Guid id, [FromForm] ProductUpdateDto dto)
        {
            var result = await _productRepository.UpdateAsync(id, dto);
            return ToActionResult(result);
        }

        // ❌ DELETE: /api/Product/{id}
        [HttpDelete("{id:guid}")]
        [HasPermission(Permissions.Products.Delete)]
        public async Task<ActionResult<bool>> Delete(Guid id)
        {
            var result = await _productRepository.DeleteAsync(id);
            return ToActionResult(result);
        }

        // 🧾 GET: /api/Product?pageNumber=1&pageSize=10
        [HttpGet]
        [HasPermission(Permissions.Products.View)]
        public async Task<ActionResult> GetAll(
            [FromQuery] Guid shopId,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string search = null,
            [FromQuery] Guid? categoryId = null)
        {
            var result = await _productRepository.GetPagedAsync(shopId, pageNumber, pageSize, search, categoryId);
            return Ok(result);
        }

        // 🔍 GET: /api/Product/{id}
        [HttpGet("{id:guid}")]
        [HasPermission(Permissions.Products.View)]
        public async Task<ActionResult<ProductDto>> GetById(Guid id)
        {
            var result = await _productRepository.GetByIdAsync(id);
            return ToActionResult(result);
        }

        // 📦 GET: /api/Product/by-barcode/{barcode}?shopId={shopId}
        [HttpGet("by-barcode/{barcode}")]
        [HasPermission(Permissions.Products.View)]
        public async Task<ActionResult<ProductDto>> GetByBarcode([FromRoute] string barcode, [FromQuery] Guid shopId)
        {
            var result = await _productRepository.GetByBarcodeAsync(shopId, barcode);
            return ToActionResult(result);
        }
    }
}
