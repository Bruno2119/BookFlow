using Booker.Core.Entities;
using Booker.Core.Interfaces;
using Booker.Core.DTOs;
using Booker.Core.Enums;
using Booker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Booker.Infrastructure.Services;

public class BusinessService : IBusinessService
{
    private readonly BookerDbContext _context;
    private readonly IAuthService _authService;

    public BusinessService(BookerDbContext context, IAuthService authService)
    {
        _context = context;
        _authService = authService;
    }

    public async Task<Negocio> CreateBusiness(Negocio negocio)
    {
        _context.Negocios.Add(negocio);
        await _context.SaveChangesAsync();
        return negocio;
    }

    public async Task<Negocio> CreateBusinessWithAdmin(BusinessWithOwnerDto dto)
    {
        // 1. Create Business
        var business = new Negocio
        {
            Nome = dto.NomeNegocio,
            Endereco = dto.Endereco,
            Telefone = dto.TelefoneNegocio,
            Descricao = dto.Descricao,
            Categoria = dto.Categoria,
            ImagemUrl = dto.ImagemUrl
        };

        // Initialize default hours in JSON
        var defaultHours = new List<object>();
        for (int i = 0; i < 7; i++)
        {
            defaultHours.Add(new
            {
                diaSemana = i,
                horaAbertura = "09:00:00",
                horaFecho = "18:00:00",
                estaAberto = i >= 1 && i <= 5
            });
        }
        business.HorariosJson = System.Text.Json.JsonSerializer.Serialize(defaultHours);

        _context.Negocios.Add(business);
        await _context.SaveChangesAsync();

        // 2. Create Owner User
        var owner = new Utilizador
        {
            Nome = dto.NomeDono,
            Email = dto.EmailDono,
            Tipo = TipoUtilizador.DONO,
            NegocioId = business.Id
        };

        await _authService.Register(owner, dto.PasswordDono);

        return business;
    }

    public async Task<IEnumerable<Negocio>> GetAllBusinesses()
    {
        return await _context.Negocios.ToListAsync();
    }

    public async Task<Negocio?> GetBusinessById(int id)
    {
        return await _context.Negocios
            .Include(n => n.Servicos)
            .Include(n => n.Funcionarios)
            .AsNoTracking()
            .FirstOrDefaultAsync(n => n.Id == id);
    }

    public async Task<bool> UpdateBusinessHours(int businessId, IEnumerable<BusinessHourUpdateDto> horarios)
    {
        try
        {
            var business = await _context.Negocios.FindAsync(businessId);
            if (business == null) return false;

            business.HorariosJson = System.Text.Json.JsonSerializer.Serialize(horarios);
            await _context.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERRO FATAL] Falha ao gravar horários: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> UpdateBusiness(Negocio negocio)
    {
        var existing = await _context.Negocios.FindAsync(negocio.Id);
        if (existing == null) return false;

        existing.Nome = negocio.Nome;
        existing.Descricao = negocio.Descricao;
        existing.Endereco = negocio.Endereco;
        existing.Telefone = negocio.Telefone;
        existing.Categoria = negocio.Categoria;
        existing.ImagemUrl = negocio.ImagemUrl;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateFullBusiness(int id, FullBusinessUpdateDto dto)
    {
        try
        {
            var business = await _context.Negocios.FirstOrDefaultAsync(n => n.Id == id);
            if (business == null) return false;

            business.Nome = dto.Nome;
            business.Descricao = dto.Descricao;
            business.Endereco = dto.Endereco;
            business.Telefone = dto.Telefone;
            business.Categoria = dto.Categoria;
            business.ImagemUrl = dto.ImagemUrl;
            business.HorariosJson = System.Text.Json.JsonSerializer.Serialize(dto.Horarios);

            await _context.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERRO CRÍTICO] Falha no UpdateFullBusiness: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> DeleteBusiness(int id)
    {
        var business = await _context.Negocios.FindAsync(id);
        if (business == null) return false;

        _context.Negocios.Remove(business);
        await _context.SaveChangesAsync();
        return true;
    }
}
