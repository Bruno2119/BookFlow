using Booker.Core.Interfaces;
using Booker.Core.Entities;
using Booker.Core.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace Booker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _authService.Authenticate(request.Email, request.Password);
        if (user == null) return Unauthorized(new { message = "Email ou senha inválidos" });

        var token = _authService.GenerateToken(user);
        return Ok(new { token, user = new { user.Id, user.Nome, user.Email, user.Tipo, user.NegocioId, user.Bio, user.Especialidades } });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var user = new Utilizador
        {
            Nome = request.Nome,
            Email = request.Email,
            Tipo = request.Tipo,
            NegocioId = request.NegocioId
        };

        var result = await _authService.Register(user, request.Password);
        return Ok(result);
    }

    [HttpGet("professionals")]
    [Authorize]
    public async Task<IActionResult> GetProfessionals([FromQuery] int? negocioId = null)
    {
        var professionals = await _authService.GetProfessionals(negocioId);
        return Ok(professionals.Select(u => new { u.Id, u.Nome, u.Email, u.Tipo, u.NegocioId, u.Bio, u.Especialidades }));
    }

    [HttpPut("profile/{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile(int id, [FromBody] UpdateProfileRequest request)
    {
        // Precisamos atualizar o AuthService para aceitar estes novos campos
        var result = await _authService.UpdateUser(id, request.Nome, request.Email, request.Password, request.Bio, request.Especialidades);
        if (!result) return NotFound(new { message = "Utilizador não encontrado" });

        return Ok(new { message = "Perfil atualizado com sucesso!" });
    }
}

public record LoginRequest(string Email, string Password);
public record RegisterRequest(string Nome, string Email, string Password, TipoUtilizador Tipo, int? NegocioId = null);
public record UpdateProfileRequest(string Nome, string Email, string? Password = null, string? Bio = null, string? Especialidades = null);
