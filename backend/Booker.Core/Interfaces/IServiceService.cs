using Booker.Core.Entities;

namespace Booker.Core.Interfaces;

public interface IServiceService
{
    Task<IEnumerable<Servico>> GetServicesByBusiness(int businessId);
    Task<Servico?> GetServiceById(int id);
    Task<Servico> CreateService(Servico servico);
    Task<bool> UpdateService(Servico servico);
    Task<bool> DeleteService(int id);
}
