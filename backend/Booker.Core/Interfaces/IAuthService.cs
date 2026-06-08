using Booker.Core.Entities;

namespace Booker.Core.Interfaces;

public interface IAuthService
{
    string GenerateToken(Utilizador user);
    Task<Utilizador?> Authenticate(string email, string password);
    Task<Utilizador> Register(Utilizador user, string password);
    Task<bool> UpdateUser(int id, string nome, string email, string? newPassword = null, string? bio = null, string? especialidades = null);
    Task<IEnumerable<Utilizador>> GetProfessionals(int? negocioId = null);
}
