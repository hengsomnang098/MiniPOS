using Microsoft.AspNetCore.Mvc;
using MiniPOS.API.Common.Constants;
using MiniPOS.API.Common.Results;

namespace MiniPOS.API.Controllers
{
    [ApiController]
    public class BaseApiController : ControllerBase
    {
        protected ActionResult<T> ToActionResult<T>(Result<T> result)
            => result.IsSuccess ? Ok(result.Value) : MapErrorsToResponse(result.Errors);

        protected ActionResult ToActionResult(Result result)
            => result.IsSuccess ? NoContent() : MapErrorsToResponse(result.Errors);

        protected ActionResult MapErrorsToResponse(Error[] errors)
        {
            if (errors is null || errors.Length == 0)
                return Problem("An unexpected error occurred.", statusCode: 500);

            var e = errors[0];

            return e.Code switch
            {
                ErrorCodes.NotFound => NotFound(e.Description),
                ErrorCodes.Validation => BadRequest(new { errors = errors.Select(x => x.Description) }),
                ErrorCodes.BadRequest => BadRequest(e.Description),
                ErrorCodes.Conflict => Conflict(e.Description),
                ErrorCodes.Unauthorized => Unauthorized(e.Description),
                ErrorCodes.Forbidden => StatusCode(403, e.Description),
                _ => Problem(
                    detail: string.Join("; ", errors.Select(x => $"{x.Code}: {x.Description}")),
                    title: e.Code,
                    statusCode: 500,
                    extensions: new Dictionary<string, object>
                    {
                        ["traceId"] = HttpContext.TraceIdentifier
                    }
                )
            };
        }
    }
}
