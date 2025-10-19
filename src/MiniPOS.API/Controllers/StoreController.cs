using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using MiniPOS.API.Application.Contracts;
using MiniPOS.API.Application.DTOs.Store;
using MiniPOS.API.Authorization;
using MiniPOS.API.Common.Constants;

namespace MiniPOS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    [EnableRateLimiting(RateLimitingConstants.PerUserPolicy)]
    public class StoreController : BaseApiController
    {
        private readonly IStoreRepository _storeRepository;

        public StoreController(IStoreRepository storeRepository)
        {
            _storeRepository = storeRepository;
        }

        private string getUserId()
        {
            return User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                    ?? User?.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
        }

        // GET: api/Store
        [HttpGet]
        [HasPermission(Permissions.Stores.View)]
        public async Task<ActionResult<IEnumerable<GetStoreDto>>> GetStores()
        {
            var stores = await _storeRepository.GetAllAsync();
            return ToActionResult(stores);
        }

        // GET: api/Store/{id}
        [HttpGet("{id}")]
        [HasPermission(Permissions.Stores.View)]
        public async Task<ActionResult<GetStoreDto>> GetStore(Guid id)
        {
            var store = await _storeRepository.GetDetailsAsync(id);
            return ToActionResult(store);
        }

        // POST: api/Store
        [HttpPost]
        [HasPermission(Permissions.Stores.Create)]
        public async Task<ActionResult<GetStoreDto>> CreateStore(CreateStoreDto createDto)
        {
            var userId = getUserId();

            if (string.IsNullOrWhiteSpace(userId))
            {
                return Unauthorized();
            }

            var result = await _storeRepository.CreateAsync(createDto, userId);
            if (!result.IsSuccess)
            {
                return MapErrorsToResponse(result.Errors);
            }
            return CreatedAtAction(nameof(GetStore), new { id = result.Value.Id }, result.Value);
        }

        // PUT: api/Store/{id}
        [HttpPut("{id}")]
        [HasPermission(Permissions.Stores.Update)]
        public async Task<IActionResult> UpdateStore(Guid id, UpdateStoreDto updateDto)
        {
            var userId = getUserId();
            var result = await _storeRepository.UpdateAsync(id, updateDto, userId);
            return ToActionResult(result);
        }

        // DELETE: api/Store/{id}
        [HttpDelete("{id}")]
        [HasPermission(Permissions.Stores.Delete)]
        public async Task<IActionResult> DeleteStore(Guid id)
        {
            var userId = getUserId();
            var result = await _storeRepository.DeleteAsync(id, userId);
            return ToActionResult(result);
        }




    }
}