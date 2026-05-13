using Microsoft.AspNetCore.Mvc;

namespace RecipeApp.Api.Infrastructure;

public sealed class AdminAuthorizeAttribute : TypeFilterAttribute
{
    public AdminAuthorizeAttribute() : base(typeof(AdminAuthorizationFilter))
    {
    }
}
