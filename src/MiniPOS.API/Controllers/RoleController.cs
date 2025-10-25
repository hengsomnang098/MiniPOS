using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Authorization;
using MiniPOS.API.Application.Contracts;
using MiniPOS.API.Application.DTOs.Role;
using MiniPOS.API.Common.Constants;
using MiniPOS.API.Authorization;
using static MiniPOS.API.Authorization.Permissions;

namespace MiniPOS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableRateLimiting(RateLimitingConstants.PerUserPolicy)]
    [Authorize] // Requires authentication for all actions
    public class RoleController : BaseApiController
    {
        private readonly IRoleRepository _roleRepository;

        public RoleController(IRoleRepository roleRepository)
        {
            _roleRepository = roleRepository;
        }

        // GET: api/Role
        [HttpGet]
        [HasPermission(Roles.View)]
        public async Task<ActionResult<List<GetRoleDto>>> GetRoles()
        {
            var result = await _roleRepository.GetAllAsync();
            return ToActionResult(result);
        }

        // GET: api/Role/{id}
        [HttpGet("{id}")]
        [HasPermission(Roles.View)]
        public async Task<ActionResult<GetRoleDto>> GetRole(Guid id)
        {
            var result = await _roleRepository.GetByIdAsync(id);
            return ToActionResult(result);
        }

        // POST: api/Role
        [HttpPost]
        [HasPermission(Roles.Create)]
        public async Task<ActionResult<GetRoleDto>> CreateRole(CreateRoleDto createDto)
        {
            var result = await _roleRepository.CreateAsync(createDto);
            return ToActionResult(result);
        }

        // PUT: api/Role/{id}
        [HttpPut("{id}")]
        [HasPermission(Roles.Update)]
        public async Task<ActionResult<GetRoleDto>> UpdateRole(Guid id, UpdateRoleDto updateDto)
        {
            var result = await _roleRepository.UpdateAsync(id, updateDto);
            return ToActionResult(result);
        }

        // DELETE: api/Role/{id}
        [HttpDelete("{id}")]
        [HasPermission(Roles.Delete)]
        public async Task<ActionResult<bool>> DeleteRole(Guid id)
        {
            var result = await _roleRepository.DeleteAsync(id);
            return ToActionResult(result);
        }

        // GET: api/Role/permissions
        [HttpGet("permissions")]
        [HasPermission(Roles.View)]
        public async Task<ActionResult<List<PermissionDto>>> GetAvailablePermissions()
        {
            var result = await _roleRepository.GetAvailablePermissionsAsync();
            return ToActionResult(result);
        }

        // GET: api/Role/{id}/permissions
        [HttpGet("{id}/permissions")]
        [HasPermission(Roles.View)]
        public async Task<ActionResult<List<PermissionDto>>> GetRolePermissions(Guid id)
        {
            var result = await _roleRepository.GetRolePermissionsAsync(id);
            return ToActionResult(result);
        }
    }
}