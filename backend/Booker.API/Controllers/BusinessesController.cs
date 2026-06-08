using Booker.Core.Entities;
using Booker.Core.Interfaces;
using Booker.Core.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Booker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BusinessesController : ControllerBase
{
    private readonly IBusinessService _businessService;

    public BusinessesController(IBusinessService businessService)
    {
        _businessService = businessService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _businessService.GetAllBusinesses());
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var business = await _businessService.GetBusinessById(id);
        if (business == null) return NotFound();
        return Ok(business);
    }

    [HttpPost]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> Create(BusinessWithOwnerDto dto)
    {
        var result = await _businessService.CreateBusinessWithAdmin(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _businessService.DeleteBusiness(id);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "ADMIN,DONO")]
    public async Task<IActionResult> Update(int id, [FromBody] Negocio negocio)
    {
        if (id != negocio.Id) return BadRequest();
        var result = await _businessService.UpdateBusiness(negocio);
        if (!result) return NotFound();
        return Ok(new { message = "Estabelecimento atualizado com sucesso!" });
    }

    [HttpPut("{id}/full")]
    [Authorize(Roles = "ADMIN,DONO")]
    public async Task<IActionResult> UpdateFull(int id, [FromBody] FullBusinessUpdateDto dto)
    {
        var result = await _businessService.UpdateFullBusiness(id, dto);
        if (!result) return BadRequest();
        return Ok(new { message = "Estabelecimento e horários atualizados com sucesso!" });
    }

    [HttpPut("{id}/hours")]
    [Authorize(Roles = "ADMIN,DONO")]
    public async Task<IActionResult> UpdateHours(int id, [FromBody] IEnumerable<BusinessHourUpdateDto> horarios)
    {
        var result = await _businessService.UpdateBusinessHours(id, horarios);
        if (!result) return BadRequest();
        return Ok(new { message = "Horários atualizados com sucesso!" });
    }
}
