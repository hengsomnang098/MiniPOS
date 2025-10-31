using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using MiniPOS.API.Application.Contracts;
using MiniPOS.API.Application.DTOs.Service;
using MiniPOS.API.Authorization;
using MiniPOS.API.Common.Constants;

namespace MiniPOS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableRateLimiting(RateLimitingConstants.PerUserPolicy)]
    [Authorize]
    public class ServiceController : BaseApiController
    {
        private readonly IServiceRepository _serviceRepository;
        public ServiceController(IServiceRepository serviceRepository)
        {
            _serviceRepository = serviceRepository;
        }

        [HttpGet]
        [Authorize(Policy = Permissions.Services.View)]
        public async Task<ActionResult<IEnumerable<GetServiceDto>>> GetAll()
        {
            var result = await _serviceRepository.GetAllAsync();
            return ToActionResult(result);
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