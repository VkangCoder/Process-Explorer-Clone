namespace ProcessExplorer.Api.Features.Auth;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProcessExplorer.Api.Auth;

[ApiController]
[Route("api/auth")]
[AllowAnonymous]
public class AuthController : ControllerBase
{
    private readonly JwtTokenService _tokenService;

    public AuthController(JwtTokenService tokenService)
    {
        _tokenService = tokenService;
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        //  hardcode 1 user. Production: database + verify hash password.
        if (request.Username != "admin" || request.Password != "admin")
        {
            return Unauthorized(new { message = "Sai tài khoản hoặc mật khẩu" });
        }

        string token = _tokenService.CreateToken(request.Username, role: "admin");

        return Ok(new
        {
            token,
            expiresInMinutes = 60,
        });
    }
}

public record LoginRequest(string Username, string Password);