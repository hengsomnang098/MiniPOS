using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using MiniPOS.API.Application.Contracts;
using MiniPOS.API.Application.DTOs.User;
using MiniPOS.API.Authorization;
using MiniPOS.API.Common.Constants;

namespace MiniPOS.API.Controllers
{
    
    [ApiController]
    [Route("api/users")]
    [EnableRateLimiting(RateLimitingConstants.PerUserPolicy)]
    [Authorize] 
    public class AdminUsersController : BaseApiController
    {
        private readonly IUserRepository _userRepository;
        private readonly ILogger<AdminUsersController> _logger;

        public AdminUsersController(IUserRepository userRepository, ILogger<AdminUsersController> logger)
        {
            _userRepository = userRepository;
            _logger = logger;
        }

        [HttpGet]
        [HasPermission(Permissions.Users.View)]
        public async Task<ActionResult<IEnumerable<GetUserDto>>> GetAll()
        {
            var result = await _userRepository.GetAllAsync();
            return ToActionResult(result);
        }

        [HttpGet("{id}")]
        [HasPermission(Permissions.Users.View)]
        public async Task<ActionResult<GetUserDto>> GetById([FromRoute] Guid id)
        {
            var result = await _userRepository.GetByIdAsync(id);
            return ToActionResult(result);
        }

        [HttpDelete("{id}")]
        [HasPermission(Permissions.Users.Delete)]
        public async Task<ActionResult> Delete([FromRoute] Guid id)
        {
            var result = await _userRepository.DeleteAsync(id);
            return ToActionResult(result);
        }

        [HttpPost]
        [HasPermission(Permissions.Users.Create)]
        public async Task<ActionResult<GetUserDto>> Create([FromBody] CreateUserDto model)
        {
            _logger.LogInformation("Admin {Admin} is creating user {Email}", User?.Identity?.Name, model.Email);

            var createdBy = User?.Identity?.Name ?? "System";
            var result = await _userRepository.CreateUserAsync(model, createdBy);

            return ToActionResult(result);
        }

        [HttpPut("{id}")]
        [HasPermission(Permissions.Users.Update)]
        public async Task<ActionResult<GetUserDto>> Update(Guid id, [FromBody] UpdateUserDto model)
        {
            var modifiedBy = User?.Identity?.Name ?? "System";
            var result = await _userRepository.UpdateUserAsync(model, id);

            return ToActionResult(result);
        }
    }
}