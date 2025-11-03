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
        private readonly ILogger<ShopController> _logger;

        public ShopController(IShopRepository shopRepository, ILogger<ShopController> logger)
        {
            _shopRepository = shopRepository;
            _logger = logger;
        }

        [HttpGet]
        [HasPermission(Shops.View)]
        public async Task<ActionResult<PaginatedResult<GetShopDto>>> GetShops(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string search = null
            )
        {
            var result = await _shopRepository.GetAllAsync(page, pageSize, search);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [HasPermission(Shops.View)]
        public async Task<ActionResult<GetShopDto>> GetShop([FromRoute] Guid id)
        {
            return ToActionResult(await _shopRepository.GetByIdAsync(id));
        }

        [HttpPost]
        [HasPermission(Shops.Create)]
        public async Task<ActionResult<GetShopDto>> CreateShop([FromBody] CreateShopDto dto)
        {
            return ToActionResult(await _shopRepository.CreateAsync(dto));
        }

        [HttpPut("{id}")]
        [HasPermission(Shops.Update)]
        public async Task<ActionResult<GetShopDto>> UpdateShop([FromRoute] Guid id, [FromBody] UpdateShopDto dto)
        {
            return ToActionResult(await _shopRepository.UpdateAsync(id, dto));
        }

        [HttpDelete("{id}")]
        [HasPermission(Shops.Delete)]
        public async Task<ActionResult<bool>> DeleteShop([FromRoute] Guid id)
        {
            return ToActionResult(await _shopRepository.DeleteAsync(id));
        }
    }
}