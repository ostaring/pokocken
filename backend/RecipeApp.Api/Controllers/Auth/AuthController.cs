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
    private readonly AdminLoginRateLimiter _loginRateLimiter;
    private readonly AdminSessionStore _sessionStore;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        IOptions<AdminAuthOptions> authOptions,
        AdminPasswordHasher passwordHasher,
        AdminLoginRateLimiter loginRateLimiter,
        AdminSessionStore sessionStore,
        ILogger<AuthController> logger)
    {
        _authOptions = authOptions.Value;
        _passwordHasher = passwordHasher;
        _loginRateLimiter = loginRateLimiter;
        _sessionStore = sessionStore;
        _logger = logger;
    }

    [HttpGet("me")]
    public ActionResult<AdminSessionResponse> GetCurrentSession()
    {
        var session = _sessionStore.GetSession(Request.Cookies[AdminAuthConstants.SessionCookieName]);
        return session is null
            ? Unauthorized()
            : Ok(new AdminSessionResponse(session.Username, session.CsrfToken));
    }

    [HttpPost("login")]
    public ActionResult<AdminSessionResponse> Login([FromBody] LoginAdminRequest request)
    {
        if (!_loginRateLimiter.TryAcquire(HttpContext))
        {
            _logger.LogWarning("Rate limited admin login attempt for username {Username}", request.Username);
            return StatusCode(StatusCodes.Status429TooManyRequests);
        }

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
        return Ok(new AdminSessionResponse(session.Username, session.CsrfToken));
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        var sessionId = Request.Cookies[AdminAuthConstants.SessionCookieName];
        var session = _sessionStore.GetSession(sessionId);
        if (session is not null && !HasValidCsrfToken(session))
        {
            _logger.LogWarning("Rejected admin logout for user {Username} because CSRF validation failed", session.Username);
            return StatusCode(StatusCodes.Status403Forbidden);
        }

        _sessionStore.RemoveSession(sessionId);
        Response.Cookies.Delete(AdminAuthConstants.SessionCookieName);

        _logger.LogInformation(
            "Processed admin logout for user {Username}",
            session?.Username ?? "unknown");

        return NoContent();
    }

    private bool HasValidCsrfToken(AdminSessionStore.AdminSession session)
    {
        return Request.Headers.TryGetValue(AdminAuthConstants.CsrfHeaderName, out var providedToken) &&
            string.Equals(providedToken.ToString(), session.CsrfToken, StringComparison.Ordinal);
    }
}
