using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using MiniPOS.API.Application.Contracts;
using MiniPOS.API.Application.DTOs.Shop;
using MiniPOS.API.Application.DTOs.ShopUser;
using MiniPOS.API.Authorization;
using MiniPOS.API.Common.Constants;
using MiniPOS.API.Common.Results;
using static MiniPOS.API.Authorization.Permissions;

namespace MiniPOS.API.Controllers
{
    [ApiController]
    [EnableRateLimiting(RateLimitingConstants.PerUserPolicy)]
    [Authorize]
    [Route("api/[controller]")]
    public class ShopUserController : BaseApiController
    {
        private readonly IShopUserRepository _repo;

        public ShopUserController(IShopUserRepository repo)
        {
            _repo = repo;
        }

        /// <summary>
        /// Get all users assigned to a specific shop
        /// </summary>
        [HttpGet("{shopId}/users")]
        [Authorize(Shops.View)]
        public async Task<ActionResult<IEnumerable<ShopUserDto>>> GetUsers(Guid shopId)
        {
            var result = await _repo.GetUsersByShopAsync(shopId);

            return ToActionResult(result);

            // return Ok(Result<IEnumerable<ShopUserDto>>.Success(result.Value!));

        }

        /// <summary>
        /// Assign one or multiple users to a shop
        /// </summary>
        [HttpPost("{shopId}/assign")]
        [Authorize(Shops.Create)]
        public async Task<ActionResult<IEnumerable<ShopUserDto>>> AssignUsers(Guid shopId, [FromBody] ShopUserCreateDto dto)
        {

            var result = await _repo.AssignUsersToShopAsync(shopId, dto.UserId.ToList());

            return ToActionResult(result);

            // return Ok(Result<IEnumerable<ShopUserDto>>.Success(result.Value!));
        }

        /// <summary>
        /// Remove a user from a shop
        /// </summary>
        [HttpDelete("{shopId}/remove/{userId}")]
        [Authorize(Shops.Delete)]
        public async Task<ActionResult<bool>> RemoveUser(Guid shopId, Guid userId)
        {
            var result = await _repo.RemoveUserFromShopAsync(shopId, userId);

            return ToActionResult(result);
        }
    }
}

