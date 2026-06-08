using Booker.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Booker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("admin")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> GetAdminStats()
    {
        return Ok(await _dashboardService.GetAdminStats());
    }

    [HttpGet("business/{businessId}")]
    [Authorize(Roles = "ADMIN,DONO")]
    public async Task<IActionResult> GetBusinessStats(int businessId)
    {
        // TODO: Em produção, verificar se o utilizador autenticado pertence a este negócio
        return Ok(await _dashboardService.GetBusinessStats(businessId));
    }
}
