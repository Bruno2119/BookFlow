using Booker.Core.DTOs;
using Booker.Core.Interfaces;
using Booker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Booker.Infrastructure.Services;

public class DashboardService : IDashboardService
{
    private readonly BookerDbContext _context;

    public DashboardService(BookerDbContext context)
    {
        _context = context;
    }

    public async Task<AdminStatsDto> GetAdminStats()
    {
        var stats = new AdminStatsDto
        {
            TotalUtilizadores = await _context.Utilizadores.CountAsync(),
            TotalNegocios = await _context.Negocios.CountAsync(),
            TotalMarcacoes = await _context.Marcacoes.CountAsync(),
            FaturacaoTotal = await _context.Marcacoes
                .Where(m => m.Estado == Core.Enums.StatusMarcacao.Concluida)
                .SumAsync(m => m.PrecoAplicado)
        };

        // Atividades Recentes
        var recentBookings = await _context.Marcacoes
            .Include(m => m.Cliente)
            .Include(m => m.Negocio)
            .OrderByDescending(m => m.DataHoraInicio)
            .Take(5)
            .ToListAsync();

        stats.AtividadesRecentes = recentBookings.Select(b => new RecentActivityDto
        {
            Descricao = $"Nova marcação: {b.Cliente?.Nome} em {b.Negocio?.Nome}",
            Data = b.DataHoraInicio,
            Tipo = "BOOKING"
        }).ToList();

        return stats;
    }

    public async Task<BusinessStatsDto> GetBusinessStats(int businessId)
    {
        var now = DateTime.Now;
        var monthStart = new DateTime(now.Year, now.Month, 1);

        var stats = new BusinessStatsDto
        {
            TotalMarcacoes = await _context.Marcacoes.CountAsync(m => m.NegocioId == businessId),
            MarcacoesHoje = await _context.Marcacoes.CountAsync(m => m.NegocioId == businessId && m.DataHoraInicio.Date == now.Date),
            FaturacaoMensal = await _context.Marcacoes
                .Where(m => m.NegocioId == businessId && 
                            m.Estado == Core.Enums.StatusMarcacao.Concluida && 
                            m.DataHoraInicio >= monthStart)
                .SumAsync(m => m.PrecoAplicado)
        };

        // Top Serviços
        stats.TopServicos = await _context.Marcacoes
            .Where(m => m.NegocioId == businessId)
            .GroupBy(m => m.Servico!.Nome)
            .Select(g => new TopServiceDto
            {
                Nome = g.Key,
                Quantidade = g.Count(),
                Total = g.Sum(x => x.PrecoAplicado)
            })
            .OrderByDescending(x => x.Quantidade)
            .Take(3)
            .ToListAsync();

        // Performance Equipa
        stats.PerformanceEquipa = await _context.Marcacoes
            .Where(m => m.NegocioId == businessId && m.Estado == Core.Enums.StatusMarcacao.Concluida)
            .GroupBy(m => m.Profissional!.Nome)
            .Select(g => new EmployeePerformanceDto
            {
                Nome = g.Key,
                TotalMarcacoes = g.Count(),
                Faturacao = g.Sum(x => x.PrecoAplicado)
            })
            .OrderByDescending(x => x.Faturacao)
            .ToListAsync();

        return stats;
    }
}
