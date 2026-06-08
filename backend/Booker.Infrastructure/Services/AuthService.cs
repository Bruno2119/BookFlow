using Booker.Core.Entities;
using Booker.Core.Interfaces;
using Booker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;

namespace Booker.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly BookerDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(BookerDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<Utilizador?> Authenticate(string email, string password)
    {
        var user = await _context.Utilizadores.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.SenhaHash))
            return null;

        return user;
    }

    public string GenerateToken(Utilizador user)
    {
        var jwtKey = _configuration["Jwt:Key"] ?? "super_secret_default_key_change_me_in_production";
        var key = Encoding.ASCII.GetBytes(jwtKey);
        var tokenHandler = new JwtSecurityTokenHandler();
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Tipo.ToString()),
                new Claim("NegocioId", user.NegocioId?.ToString() ?? "")
            }),
            Expires = DateTime.UtcNow.AddDays(7),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    public async Task<Utilizador> Register(Utilizador user, string password)
    {
        user.SenhaHash = BCrypt.Net.BCrypt.HashPassword(password);
        _context.Utilizadores.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task<bool> UpdateUser(int id, string nome, string email, string? newPassword = null, string? bio = null, string? especialidades = null)
    {
        var user = await _context.Utilizadores.FindAsync(id);
        if (user == null) return false;

        user.Nome = nome;
        user.Email = email;
        user.Bio = bio;
        user.Especialidades = especialidades;

        if (!string.IsNullOrWhiteSpace(newPassword))
        {
            user.SenhaHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        }

        _context.Utilizadores.Update(user);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<Utilizador>> GetProfessionals(int? negocioId = null)
    {
        var query = _context.Utilizadores
            .Where(u => u.Tipo == Core.Enums.TipoUtilizador.PROFISSIONAL);

        if (negocioId.HasValue)
        {
            query = query.Where(u => u.NegocioId == negocioId.Value);
        }

        return await query.ToListAsync();
    }
}
