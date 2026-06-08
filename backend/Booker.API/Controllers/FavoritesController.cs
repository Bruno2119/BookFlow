using Booker.Core.Entities;
using Booker.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Booker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FavoritesController : ControllerBase
{
    private readonly BookerDbContext _context;

    public FavoritesController(BookerDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetUserFavorites()
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

        var favorites = await _context.Favoritos
            .Where(f => f.UtilizadorId == userId)
            .Select(f => f.NegocioId)
            .ToListAsync();

        return Ok(favorites);
    }

    [HttpPost("{businessId}")]
    public async Task<IActionResult> ToggleFavorite(int businessId)
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

        var existing = await _context.Favoritos
            .FirstOrDefaultAsync(f => f.UtilizadorId == userId && f.NegocioId == businessId);

        if (existing != null)
        {
            _context.Favoritos.Remove(existing);
            await _context.SaveChangesAsync();
            return Ok(new { favorited = false });
        }
        else
        {
            var favorito = new Favorito
            {
                UtilizadorId = userId,
                NegocioId = businessId
            };
            _context.Favoritos.Add(favorito);
            await _context.SaveChangesAsync();
            return Ok(new { favorited = true });
        }
    }
}
