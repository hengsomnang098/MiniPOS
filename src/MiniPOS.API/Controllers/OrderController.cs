using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Authorization;
using MiniPOS.API.Application.Contracts;
using MiniPOS.API.Application.DTOs.Order;
using MiniPOS.API.Common.Constants;
using MiniPOS.API.Authorization;
using static MiniPOS.API.Authorization.Permissions;
using MiniPOS.API.Common.Results;

namespace MiniPOS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableRateLimiting(RateLimitingConstants.PerUserPolicy)]
    [Authorize]
    public class OrderController : BaseApiController
    {
        private readonly IOrderRepository _orderRepository;

        public OrderController(IOrderRepository orderRepository)
        {
            _orderRepository = orderRepository;
        }

        // 🧾 POST: api/Order
        [HttpPost]
        [HasPermission(Orders.Create)]
        public async Task<ActionResult<OrderDto>> CreateOrder([FromBody] OrderCreateDto request)
        {
            if (request == null || request.Items == null || !request.Items.Any())
                return BadRequest(Result<OrderDto>.Failure(new Error(ErrorCodes.Validation, "Order must contain at least one item.")));

            var result = await _orderRepository.CreateAsync(request);
            return ToActionResult(result);
        }

        // 🔍 GET: api/Order/{id}
        [HttpGet("{id:guid}")]
        [HasPermission(Orders.View)]
        public async Task<ActionResult<OrderDto>> GetOrderById([FromRoute] Guid id)
        {
            var result = await _orderRepository.GetByIdAsync(id);
            return ToActionResult(result);
        }

        // 📦 GET: api/Order/shop/{shopId}?page=1&pageSize=10&startDate=2025-11-04&endDate=2025-11-05
        [HttpGet("shop/{shopId:guid}")]
        [HasPermission(Orders.View)]
        public async Task<ActionResult<PaginatedResult<OrderDto>>> GetOrdersByShop(
            [FromRoute] Guid shopId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            // Determine effective date range
            // Default to today (UTC) if none provided
            DateTime utcTodayStart = DateTime.UtcNow.Date;
            DateTime utcTomorrowStart = utcTodayStart.AddDays(1);

            // Normalize incoming dates to UTC (preserve intent if Kind is Local)
            static DateTime NormalizeToUtc(DateTime dt)
            {
                return dt.Kind switch
                {
                    DateTimeKind.Utc => dt,
                    DateTimeKind.Local => dt.ToUniversalTime(),
                    _ => DateTime.SpecifyKind(dt, DateTimeKind.Utc)
                };
            }

            DateTime startUtc = startDate.HasValue ? NormalizeToUtc(startDate.Value) : utcTodayStart;
            DateTime endUtc = endDate.HasValue ? NormalizeToUtc(endDate.Value) : utcTomorrowStart;

            // If user is Staff, force filter to today regardless of query
            if (User.IsInRole("Staff"))
            {
                startUtc = utcTodayStart;
                endUtc = utcTomorrowStart;
            }

            // Ensure end is after start; if not, adjust to a 1-day window
            if (endUtc <= startUtc)
            {
                endUtc = startUtc.AddDays(1);
            }

            var result = await _orderRepository.GetPagedByShopAsync(shopId, page, pageSize, startUtc, endUtc);
            return Ok(result);
        }

        // ❌ PUT: api/Order/{id}/cancel
        [HttpPut("{id:guid}/cancel")]
        [HasPermission(Orders.Update)]
        public async Task<ActionResult<bool>> CancelOrder([FromRoute] Guid id)
        {
            var result = await _orderRepository.CancelAsync(id);
            return ToActionResult(result);
        }
    }
}
