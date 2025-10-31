using Microsoft.AspNetCore.Mvc;
using MiniPOS.API.Common.Constants;
using MiniPOS.API.Common.Results;

namespace MiniPOS.API.Controllers
{
    [ApiController]
    public class BaseApiController : ControllerBase
    {
        protected ActionResult<T> ToActionResult<T>(Result<T> result)
            => result.IsSuccess ? Ok(result.Value) : MapErrorsToResponse(this, result.Errors);

        protected ActionResult ToActionResult(Result result)
            => result.IsSuccess ? NoContent() : MapErrorsToResponse(this, result.Errors);

        protected ActionResult<T> ToActionResult<T>(PaginatedResult<T> result)
            => result.IsSuccess ? Ok(result) : MapErrorsToResponse(this, result.Errors);

        // ✅ Fixed version
        public static ActionResult MapErrorsToResponse(ControllerBase controller, Error[] errors)
        {
            if (errors is null || errors.Length == 0)
                return controller.Problem("An unexpected error occurred.", statusCode: 500);

            var e = errors[0];

            return e.Code switch
            {
                ErrorCodes.NotFound => controller.NotFound(e.Description),

                ErrorCodes.Validation => controller.BadRequest(new
                {
                    errors = errors.Select(x => x.Description)
                }),

                ErrorCodes.BadRequest => controller.BadRequest(e.Description),

                ErrorCodes.Conflict => controller.Conflict(e.Description),

                ErrorCodes.Unauthorized => controller.Unauthorized(e.Description),

                ErrorCodes.Forbidden => controller.StatusCode(403, e.Description),

                _ => controller.Problem(
                    detail: string.Join("; ", errors.Select(x => $"{x.Code}: {x.Description}")),
                    title: e.Code,
                    statusCode: 500
                    // ❌ Removed manual traceId addition here
                )
            };
        }
    }
}
