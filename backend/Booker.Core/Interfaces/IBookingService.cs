using Booker.Core.Entities;

namespace Booker.Core.Interfaces;

public interface IBookingService
{
    Task<IEnumerable<Marcacao>> GetBookingsByBusiness(int businessId);
    Task<IEnumerable<Marcacao>> GetBookingsByProfessional(int professionalId);
    Task<IEnumerable<Marcacao>> GetBookingsByClient(int clientId);
    Task<Marcacao?> GetBookingById(int id);
    Task<Marcacao> CreateBooking(Marcacao marcacao);
    Task<bool> UpdateBookingStatus(int id, Enums.StatusMarcacao status);
    Task<IEnumerable<DateTime>> GetAvailableSlots(int professionalId, int serviceId, DateTime date);
}
