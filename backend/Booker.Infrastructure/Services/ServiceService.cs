using Booker.Core.Entities;
using Booker.Core.Interfaces;
using Booker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Booker.Infrastructure.Services;

public class ServiceService : IServiceService
{
    private readonly BookerDbContext _context;

    public ServiceService(BookerDbContext context)
    {
        _context = context;
    }

    public async Task<Servico> CreateService(Servico servico)
    {
        _context.Servicos.Add(servico);
        await _context.SaveChangesAsync();
        return servico;
    }

    public async Task<bool> DeleteService(int id)
    {
        var servico = await _context.Servicos.FindAsync(id);
        if (servico == null) return false;

        _context.Servicos.Remove(servico);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<Servico?> GetServiceById(int id)
    {
        return await _context.Servicos.FindAsync(id);
    }

    public async Task<IEnumerable<Servico>> GetServicesByBusiness(int businessId)
    {
        return await _context.Servicos.Where(s => s.NegocioId == businessId).ToListAsync();
    }

    public async Task<bool> UpdateService(Servico servico)
    {
        _context.Entry(servico).State = EntityState.Modified;
        try
        {
            await _context.SaveChangesAsync();
            return true;
        }
        catch (DbUpdateConcurrencyException)
        {
            return false;
        }
    }
}
