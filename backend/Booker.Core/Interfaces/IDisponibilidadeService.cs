using Booker.Core.Entities;

namespace Booker.Core.Interfaces;

public interface IDisponibilidadeService
{
    Task<IEnumerable<Disponibilidade>> GetByProfessional(int professionalId);
    Task<Disponibilidade> Upsert(Disponibilidade availability);
    Task<bool> Delete(int id);
}
