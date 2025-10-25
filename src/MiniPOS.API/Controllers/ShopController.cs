using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using MiniPOS.API.Application.Contracts;
using MiniPOS.API.Application.DTOs.Shop;
using MiniPOS.API.Authorization;
using MiniPOS.API.Common.Constants;
using MiniPOS.API.Common.Results;
using static MiniPOS.API.Authorization.Permissions;

namespace MiniPOS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableRateLimiting(RateLimitingConstants.PerUserPolicy)]
    [Authorize]
    public class ShopController : BaseApiController
    {
        private readonly IShopRepository _shopRepository;

        public ShopController(IShopRepository shopRepository)
        {
            _shopRepository = shopRepository;
        }

        [HttpGet]
        [HasPermission(Shops.View)]
        public async Task<ActionResult<PaginatedResult<GetShopDto>>> GetShops(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userIdValue))
                return Unauthorized("User ID claim is missing.");

            // safely convert string to Guid
            if (!Guid.TryParse(userIdValue, out var userId))
                return Unauthorized("Invalid user ID format.");
            var isSuperAdmin = User.IsInRole("Super Admin");

            var result = await _shopRepository.GetAllAsync(page, pageSize, userId, isSuperAdmin);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [HasPermission(Shops.View)]
        public async Task<ActionResult<GetShopDto>> GetShop(Guid id)
        {
            return ToActionResult(await _shopRepository.GetByIdAsync(id));
        }

        [HttpPost]
        [HasPermission(Shops.Create)]
        public async Task<ActionResult<GetShopDto>> CreateShop(CreateShopDto dto)
        {
            return ToActionResult(await _shopRepository.CreateAsync(dto));
        }

        [HttpPut("{id}")]
        [HasPermission(Shops.Update)]
        public async Task<ActionResult<GetShopDto>> UpdateShop(Guid id, UpdateShopDto dto)
        {
            return ToActionResult(await _shopRepository.UpdateAsync(id, dto));
        }

        [HttpDelete("{id}")]
        [HasPermission(Shops.Delete)]
        public async Task<ActionResult<bool>> DeleteShop(Guid id)
        {
            return ToActionResult(await _shopRepository.DeleteAsync(id));
        }
    }
}