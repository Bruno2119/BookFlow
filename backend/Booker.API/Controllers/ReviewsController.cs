using Booker.Core.Entities;
using Booker.Core.DTOs;
using Booker.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Booker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly BookerDbContext _context;

    public ReviewsController(BookerDbContext context)
    {
        _context = context;
    }

    [HttpGet("business/{businessId}")]
    public async Task<IActionResult> GetBusinessReviews(int businessId)
    {
        var reviews = await _context.Avaliacoes
            .Where(a => a.NegocioId == businessId)
            .Include(a => a.Utilizador)
            .OrderByDescending(a => a.DataCriacao)
            .Select(a => new {
                a.Id,
                a.Pontuacao,
                a.Comentario,
                a.DataCriacao,
                UtilizadorNome = a.Utilizador != null ? a.Utilizador.Nome : "Utilizador Anónimo"
            })
            .ToListAsync();

        return Ok(reviews);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateReview(ReviewCreateDto dto)
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

        if (dto.Pontuacao < 1 || dto.Pontuacao > 5)
            return BadRequest(new { message = "A pontuação deve estar entre 1 e 5." });

        var review = new Avaliacao
        {
            NegocioId = dto.NegocioId,
            UtilizadorId = userId,
            Pontuacao = dto.Pontuacao,
            Comentario = dto.Comentario,
            DataCriacao = DateTime.UtcNow
        };

        _context.Avaliacoes.Add(review);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Avaliação submetida com sucesso!" });
    }
}
