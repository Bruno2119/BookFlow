using Booker.Core.DTOs;

namespace Booker.Core.Interfaces;

public interface IDashboardService
{
    Task<AdminStatsDto> GetAdminStats();
    Task<BusinessStatsDto> GetBusinessStats(int businessId);
}
