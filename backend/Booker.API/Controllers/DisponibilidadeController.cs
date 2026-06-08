using Booker.Core.Entities;
using Booker.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace Booker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DisponibilidadeController : ControllerBase
{
    private readonly IDisponibilidadeService _disponibilidadeService;

    public DisponibilidadeController(IDisponibilidadeService disponibilidadeService)
    {
        _disponibilidadeService = disponibilidadeService;
    }

    [HttpGet("professional/{professionalId}")]
    [Authorize]
    public async Task<IActionResult> GetByProfessional(int professionalId)
    {
        return Ok(await _disponibilidadeService.GetByProfessional(professionalId));
    }

    [HttpPost]
    [Authorize(Roles = "ADMIN,PROFISSIONAL")]
    public async Task<IActionResult> Upsert(Disponibilidade availability)
    {
        return Ok(await _disponibilidadeService.Upsert(availability));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "ADMIN,PROFISSIONAL")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _disponibilidadeService.Delete(id);
        if (!result) return NotFound();
        return NoContent();
    }
}
