using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using MiniPOS.API.Application.Contracts;
using MiniPOS.API.Application.DTOs.Store;
using MiniPOS.API.Common.Constants;

namespace MiniPOS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableRateLimiting(RateLimitingConstants.PerUserPolicy)]
    public class StoreController : BaseApiController
    {
        private readonly IStoreRepository _storeRepository;

        public StoreController(IStoreRepository storeRepository)
        {
            _storeRepository = storeRepository;
        }

        // GET: api/Store
        [HttpGet]
        public async Task<ActionResult<IEnumerable<GetStoreDto>>> GetStores()
        {
            var stores = await _storeRepository.GetAllAsync();
            return ToActionResult(stores);
        }

        // GET: api/Store/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<GetStoreDto>> GetStore(Guid id)
        {
            var store = await _storeRepository.GetDetailsAsync(id);
            return ToActionResult(store);
        }

        // POST: api/Store
        [HttpPost]
        public async Task<ActionResult<GetStoreDto>> CreateStore(CreateStoreDto createDto)
        {
            var result = await _storeRepository.CreateAsync(createDto);
            if (!result.IsSuccess)
            {
                return MapErrorsToResponse(result.Errors);
            }
            return CreatedAtAction(nameof(GetStore), new { id = result.Value.Id }, result.Value);
        }

        // PUT: api/Store/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStore(Guid id, UpdateStoreDto updateDto)
        {
            var result = await _storeRepository.UpdateAsync(id, updateDto);
            return ToActionResult(result);
        }

        // DELETE: api/Store/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStore(Guid id)
        {
            var result = await _storeRepository.DeleteAsync(id);
            return ToActionResult(result);
        }




    }
}