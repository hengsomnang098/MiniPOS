using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using MiniPOS.API.Application.Contracts;
using MiniPOS.API.Application.DTOs.Service;
using MiniPOS.API.Authorization;
using MiniPOS.API.Common.Constants;
using MiniPOS.API.Common.Results;
using MiniPOS.API.Domain;

namespace MiniPOS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableRateLimiting(RateLimitingConstants.PerUserPolicy)]
    [Authorize]
    public class ServiceController : BaseApiController
    {
        private readonly IServiceRepository _serviceRepository;
        private readonly ApplicationDbContext _context;
        public ServiceController(IServiceRepository serviceRepository,ApplicationDbContext context)
        {
            _serviceRepository = serviceRepository;
            _context = context;
        }

        [HttpGet("shop/{shopId}")]
        [Authorize(Policy = Permissions.Services.View)]
        public async Task<ActionResult<PaginatedResult<GetServiceDto>>> GetAll(
            [FromRoute] Guid shopId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string search = null)
        {
            var result = await _serviceRepository.GetAllAsync(shopId, page, pageSize, search);
            return Ok(result);
        }

        [HttpGet("{categoryId:guid}/list")]
        public async Task<IActionResult> GetServicesByCategory(Guid categoryId)
        {
            var services = await _context.Services
                .Where(s => s.CategoryId == categoryId)
                .Select(s => new { s.Id, s.Name })
                .ToListAsync();

            return Ok(services);
        }

        [HttpGet("{id}")]
        [Authorize(Policy = Permissions.Services.View)]
        public async Task<ActionResult<GetServiceDto>> GetById([FromRoute] Guid id)
        {
            var result = await _serviceRepository.GetByIdAsync(id);
            return ToActionResult(result);
        }

        [HttpPost]
        [Authorize(Policy = Permissions.Services.Create)]
        public async Task<ActionResult<GetServiceDto>> Create([FromBody] CreateServiceDto createDto)
        {
            var result = await _serviceRepository.CreateServiceAsync(createDto);
            return ToActionResult(result);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = Permissions.Services.Update)]
        public async Task<ActionResult<GetServiceDto>> Update([FromRoute] Guid id, [FromBody] UpdateServiceDto updateDto)
        {
            var result = await _serviceRepository.UpdateServiceAsync(updateDto, id);
            return ToActionResult(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = Permissions.Services.Delete)]
        public async Task<ActionResult<bool>> Delete([FromRoute] Guid id)
        {
            var result = await _serviceRepository.DeleteAsync(id);
            return ToActionResult(result);

        }

    }
}