using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using MiniPOS.API.Application.Contracts;
using MiniPOS.API.Application.DTOs.Category;
using MiniPOS.API.Authorization;
using MiniPOS.API.Common.Constants;

namespace MiniPOS.API.Controllers
{
    [ApiController]
    [Route("api/categories")]
    [EnableRateLimiting(RateLimitingConstants.PerUserPolicy)]
    [Authorize]
    public class CategoryController : BaseApiController
    {
        private readonly ICategoryRepository _categoryRepository;
        private readonly ILogger<CategoryController> _logger;

        public CategoryController(ICategoryRepository categoryRepository, ILogger<CategoryController> logger)
        {
            _categoryRepository = categoryRepository;
            _logger = logger;
        }

        // ✅ GET: /api/categories/shop/{shopId}
        [HttpGet("shop/{shopId:guid}")]
        [HasPermission(Permissions.Categories.View)]
        public async Task<ActionResult<List<GetCategoryDto>>> GetAllByShopId([FromRoute] Guid shopId)
        {
            var result = await _categoryRepository.GetAllAsync(shopId);
            return ToActionResult(result);
        }

        // ✅ GET: /api/categories/{id}
        [HttpGet("{id:guid}")]
        [HasPermission(Permissions.Categories.View)]
        public async Task<ActionResult<GetCategoryDto>> GetById([FromRoute] Guid id)
        {
            var result = await _categoryRepository.GetByIdAsync(id);
            return ToActionResult(result);
        }

        // ✅ POST: /api/categories
        [HttpPost]
        [HasPermission(Permissions.Categories.Create)]
        public async Task<ActionResult<GetCategoryDto>> Create([FromBody] CreateCategoryDto model)
        {
            _logger.LogInformation("User {User} is creating category {Name}", User?.Identity?.Name, model.CategoryName);

            var result = await _categoryRepository.CreateAsync(model);
            return ToActionResult(result);
        }

        // ✅ PUT: /api/categories/{id}
        [HttpPut("{id:guid}")]
        [HasPermission(Permissions.Categories.Update)]
        public async Task<ActionResult<GetCategoryDto>> Update([FromRoute] Guid id, [FromBody] UpdateCategoryDto model)
        {
            if (id != model.Id)
                return BadRequest("Category ID mismatch");

            _logger.LogInformation("User {User} is updating category {Id}", User?.Identity?.Name, id);

            var result = await _categoryRepository.UpdateAsync(model);
            return ToActionResult(result);
        }

        // ✅ DELETE: /api/categories/{id}
        [HttpDelete("{id:guid}")]
        [HasPermission(Permissions.Categories.Delete)]
        public async Task<ActionResult<bool>> Delete([FromRoute] Guid id)
        {
            _logger.LogInformation("User {User} is deleting category {Id}", User?.Identity?.Name, id);

            var result = await _categoryRepository.DeleteAsync(id);
            return ToActionResult(result);
        }
    }
}
