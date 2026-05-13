using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using RecipeApp.Api.Contracts;
using RecipeApp.Api.Infrastructure;

namespace RecipeApp.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController : ControllerBase
{
    private readonly AdminAuthOptions _authOptions;
    private readonly AdminPasswordHasher _passwordHasher;
    private readonly AdminSessionStore _sessionStore;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        IOptions<AdminAuthOptions> authOptions,
        AdminPasswordHasher passwordHasher,
        AdminSessionStore sessionStore,
        ILogger<AuthController> logger)
    {
        _authOptions = authOptions.Value;
        _passwordHasher = passwordHasher;
        _sessionStore = sessionStore;
        _logger = logger;
    }

    [HttpGet("me")]
    public ActionResult<AdminSessionResponse> GetCurrentSession()
    {
        var session = _sessionStore.GetSession(Request.Cookies[AdminAuthConstants.SessionCookieName]);
        return session is null
            ? Unauthorized()
            : Ok(new AdminSessionResponse(session.Username));
    }

    [HttpPost("login")]
    public ActionResult<AdminSessionResponse> Login([FromBody] LoginAdminRequest request)
    {
        if (!string.Equals(request.Username, _authOptions.Username, StringComparison.Ordinal) ||
            !_passwordHasher.Verify(
                request.Password,
                _authOptions.PasswordHash,
                _authOptions.Password))
        {
            _logger.LogWarning("Rejected admin login attempt for username {Username}", request.Username);
            return Unauthorized();
        }

        var session = _sessionStore.CreateSession(_authOptions.Username!);
        Response.Cookies.Append(
            AdminAuthConstants.SessionCookieName,
            session.Id,
            new CookieOptions
            {
                HttpOnly = true,
                SameSite = SameSiteMode.Strict,
                Secure = Request.IsHttps,
                IsEssential = true,
                Expires = session.ExpiresAtUtc
            });

        _logger.LogInformation("Admin login succeeded for username {Username}", session.Username);
        return Ok(new AdminSessionResponse(session.Username));
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        var sessionId = Request.Cookies[AdminAuthConstants.SessionCookieName];
        var session = _sessionStore.GetSession(sessionId);

        _sessionStore.RemoveSession(sessionId);
        Response.Cookies.Delete(AdminAuthConstants.SessionCookieName);

        _logger.LogInformation(
            "Processed admin logout for user {Username}",
            session?.Username ?? "unknown");

        return NoContent();
    }
}
