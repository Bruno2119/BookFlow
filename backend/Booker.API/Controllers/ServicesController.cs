using Booker.Core.Entities;
using Booker.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Booker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ServicesController : ControllerBase
{
    private readonly IServiceService _serviceService;

    public ServicesController(IServiceService serviceService)
    {
        _serviceService = serviceService;
    }

    [HttpGet("business/{businessId}")]
    public async Task<IActionResult> GetByBusiness(int businessId)
    {
        return Ok(await _serviceService.GetServicesByBusiness(businessId));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var service = await _serviceService.GetServiceById(id);
        if (service == null) return NotFound();
        return Ok(service);
    }

    [HttpPost]
    [Authorize(Roles = "ADMIN,PROFISSIONAL,DONO")]
    public async Task<IActionResult> Create(Servico servico)
    {
        var result = await _serviceService.CreateService(servico);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "ADMIN,PROFISSIONAL,DONO")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _serviceService.DeleteService(id);
        if (!result) return NotFound();
        return NoContent();
    }
}
