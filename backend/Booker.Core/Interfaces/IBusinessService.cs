using Booker.Core.Entities;
using Booker.Core.DTOs;

namespace Booker.Core.Interfaces;

public interface IBusinessService
{
    Task<IEnumerable<Negocio>> GetAllBusinesses();
    Task<Negocio?> GetBusinessById(int id);
    Task<Negocio> CreateBusiness(Negocio negocio);
    Task<Negocio> CreateBusinessWithAdmin(BusinessWithOwnerDto dto);
    Task<bool> UpdateBusiness(Negocio negocio);
    Task<bool> UpdateFullBusiness(int id, FullBusinessUpdateDto dto);
    Task<bool> DeleteBusiness(int id);
    Task<bool> UpdateBusinessHours(int businessId, IEnumerable<BusinessHourUpdateDto> horarios);
}
