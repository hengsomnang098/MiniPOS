using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Authorization;
using MiniPOS.API.Application.Contracts;
using MiniPOS.API.Application.DTOs.Category;
using MiniPOS.API.Common.Constants;
using MiniPOS.API.Authorization;
using static MiniPOS.API.Authorization.Permissions;

namespace MiniPOS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableRateLimiting(RateLimitingConstants.PerUserPolicy)]
    [Authorize] // Requires authentication for all actions
    public class CategoryController : BaseApiController
    {
        private readonly ICategoryRepository _categoryRepository;

        public CategoryController(ICategoryRepository categoryRepository)
        {
            _categoryRepository = categoryRepository;
        }

        // GET: api/Category
        [HttpGet]
        [HasPermission(Categories.View)]
        public async Task<ActionResult<IEnumerable<GetCategoryDto>>> GetCategories()
        {
            var result = await _categoryRepository.GetAllAsync();
            return ToActionResult(result);
        }

        // GET: api/Category/{id}
        [HttpGet("{id}")]
        [HasPermission(Categories.View)]
        public async Task<ActionResult<GetCategoryDto>> GetCategory(Guid id)
        {
            var result = await _categoryRepository.GetByIdAsync(id);
            return ToActionResult(result);
        }

        // POST: api/Category
        [HttpPost]
        [HasPermission(Categories.Create)]
        public async Task<ActionResult<GetCategoryDto>> CreateCategory(CreateCategoryDto createDto)
        {
            var result = await _categoryRepository.CreateAsync(createDto);
            if (!result.IsSuccess)
            {
                return MapErrorsToResponse(result.Errors);
            }
            return CreatedAtAction(nameof(GetCategory), new { id = result.Value.Id }, result.Value);
        }

        // PUT: api/Category/{id}
        [HttpPut("{id}")]
        [HasPermission(Categories.Update)]
        public async Task<IActionResult> UpdateCategory(Guid id, UpdateCategoryDto updateDto)
        {
            var result = await _categoryRepository.UpdateAsync(id, updateDto);
            return ToActionResult(result);
        }

        // DELETE: api/Category/{id}
        [HttpDelete("{id}")]
        [HasPermission(Categories.Delete)]
        public async Task<IActionResult> DeleteCategory(Guid id)
        {
            var result = await _categoryRepository.DeleteAsync(id);
            return ToActionResult(result);
        }
    }


}
