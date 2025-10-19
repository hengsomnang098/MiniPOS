using Microsoft.AspNetCore.Authorization;

namespace MiniPOS.API.Authorization
{
    public class HasPermissionAttribute : AuthorizeAttribute
    {
        public HasPermissionAttribute(string permission) 
            : base(policy: permission)
        {
        }
    }
}