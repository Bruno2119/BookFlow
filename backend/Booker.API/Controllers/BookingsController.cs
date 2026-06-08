using Booker.Core.Entities;
using Booker.Core.Interfaces;
using Booker.Core.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace Booker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly IBookingService _bookingService;

    public BookingsController(IBookingService bookingService)
    {
        _bookingService = bookingService;
    }

    [HttpGet("business/{businessId}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> GetByBusiness(int businessId)
    {
        return Ok(await _bookingService.GetBookingsByBusiness(businessId));
    }

    [HttpGet("professional/{professionalId}")]
    [Authorize(Roles = "ADMIN,PROFISSIONAL")]
    public async Task<IActionResult> GetByProfessional(int professionalId)
    {
        return Ok(await _bookingService.GetBookingsByProfessional(professionalId));
    }

    [HttpGet("client/{clientId}")]
    [Authorize]
    public async Task<IActionResult> GetByClient(int clientId)
    {
        return Ok(await _bookingService.GetBookingsByClient(clientId));
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create(Marcacao marcacao)
    {
        try 
        {
            var result = await _bookingService.CreateBooking(marcacao);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{id}")]
    [Authorize]
    public async Task<IActionResult> GetById(int id)
    {
        var booking = await _bookingService.GetBookingById(id);
        if (booking == null) return NotFound();
        return Ok(booking);
    }

    [HttpPatch("{id}/status")]
    [Authorize]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] StatusMarcacao status)
    {
        var result = await _bookingService.UpdateBookingStatus(id, status);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpGet("slots")]
    public async Task<IActionResult> GetSlots(int professionalId, int serviceId, DateTime date)
    {
        return Ok(await _bookingService.GetAvailableSlots(professionalId, serviceId, date));
    }
}
