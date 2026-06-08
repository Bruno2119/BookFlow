using Booker.Core.Entities;
using Booker.Core.Enums;
using Booker.Core.Interfaces;
using Booker.Core.DTOs;
using Booker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Booker.Infrastructure.Services;

public class BookingService : IBookingService
{
    private readonly BookerDbContext _context;
    private readonly IEmailService _emailService;

    public BookingService(BookerDbContext context, IEmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    public async Task<Marcacao> CreateBooking(Marcacao marcacao)
    {
        if (marcacao.DataHoraInicio < DateTime.Now)
            throw new InvalidOperationException("Cannot create a booking in the past.");

        var overlap = await _context.Marcacoes.AnyAsync(m => 
            m.ProfissionalId == marcacao.ProfissionalId &&
            m.Estado != StatusMarcacao.Cancelada &&
            m.Estado != StatusMarcacao.Rejeitada &&
            ((marcacao.DataHoraInicio >= m.DataHoraInicio && marcacao.DataHoraInicio < m.DataHoraFim) ||
             (marcacao.DataHoraFim > m.DataHoraInicio && marcacao.DataHoraFim <= m.DataHoraFim)));

        if (overlap)
            throw new InvalidOperationException("Professional already has a booking at this time.");

        marcacao.Estado = StatusMarcacao.Confirmada; 
        _context.Marcacoes.Add(marcacao);
        await _context.SaveChangesAsync();

        try 
        {
            var fullBooking = await GetBookingById(marcacao.Id);
            if (fullBooking?.Cliente != null)
            {
                string body = $@"Olá {fullBooking.Cliente.Nome}, a sua marcação para {fullBooking.Servico?.Nome} foi confirmada!";
                await _emailService.SendEmailAsync(fullBooking.Cliente.Email, "Marcação Confirmada - Booker", body);
            }
        }
        catch { }

        return marcacao;
    }

    public async Task<IEnumerable<DateTime>> GetAvailableSlots(int professionalId, int serviceId, DateTime date)
    {
        var service = await _context.Servicos.FindAsync(serviceId);
        if (service == null) return Enumerable.Empty<DateTime>();

        // 1. Obter Profissional e o Negócio
        var professional = await _context.Utilizadores
            .Include(u => u.Negocio)
            .FirstOrDefaultAsync(u => u.Id == professionalId);

        if (professional == null || professional.Negocio == null)
            return Enumerable.Empty<DateTime>();

        // 2. Obter Overrides do Profissional
        var overrides = await _context.Disponibilidades
            .Where(d => d.ProfissionalId == professionalId)
            .ToListAsync();

        // 3. Determinar a Disponibilidade Base para ESTA DATA
        Disponibilidade? baseAvail = null;

        // PRIORIDADE 1: Alteração Pontual (Data específica no calendário)
        baseAvail = overrides.FirstOrDefault(o => o.DataEspecifica.HasValue && o.DataEspecifica.Value.Date == date.Date);

        // PRIORIDADE 2: Horário do Negócio (O JSON do Dono manda no semanal)
        if (baseAvail == null && !string.IsNullOrEmpty(professional.Negocio.HorariosJson))
        {
            try {
                var businessHours = JsonSerializer.Deserialize<List<BusinessHourUpdateDto>>(
                    professional.Negocio.HorariosJson, 
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                
                var bHour = businessHours?.FirstOrDefault(bh => bh.DiaSemana == (int)date.DayOfWeek);
                if (bHour != null)
                {
                    baseAvail = new Disponibilidade
                    {
                        HoraInicio = TimeSpan.Parse(bHour.HoraAbertura?.Split('.')[0] ?? "09:00:00"),
                        HoraFim = TimeSpan.Parse(bHour.HoraFecho?.Split('.')[0] ?? "18:00:00"),
                        Ativo = bHour.EstaAberto
                    };
                }
            } catch { }
        }

        // PRIORIDADE 3: Fallback de Segurança (Seg-Sex 9-18)
        if (baseAvail == null)
        {
            if (date.DayOfWeek != DayOfWeek.Saturday && date.DayOfWeek != DayOfWeek.Sunday)
            {
                baseAvail = new Disponibilidade { HoraInicio = new TimeSpan(9,0,0), HoraFim = new TimeSpan(18,0,0), Ativo = true };
            }
            else return Enumerable.Empty<DateTime>(); // Fim de semana fechado por padrão se não houver JSON
        }

        // Se o dia estiver desativado (fechado), zero slots.
        if (!baseAvail.Ativo) return Enumerable.Empty<DateTime>();

        // 4. Gerar Slots
        var slots = new List<DateTime>();
        var currentSlot = date.Date.Add(baseAvail.HoraInicio);
        var endOfDay = date.Date.Add(baseAvail.HoraFim);
        var now = DateTime.Now;

        var existingBookings = await _context.Marcacoes
            .Where(m => m.ProfissionalId == professionalId && 
                        m.DataHoraInicio.Date == date.Date && 
                        m.Estado != StatusMarcacao.Cancelada && 
                        m.Estado != StatusMarcacao.Rejeitada)
            .ToListAsync();

        while (currentSlot.AddMinutes(service.DuracaoMinutos) <= endOfDay)
        {
            if (currentSlot > now)
            {
                var isBusy = existingBookings.Any(b => 
                    (currentSlot >= b.DataHoraInicio && currentSlot < b.DataHoraFim) ||
                    (currentSlot.AddMinutes(service.DuracaoMinutos) > b.DataHoraInicio && currentSlot.AddMinutes(service.DuracaoMinutos) <= b.DataHoraFim));

                if (!isBusy) slots.Add(currentSlot);
            }
            currentSlot = currentSlot.AddMinutes(30);
        }

        return slots;
    }

    public async Task<Marcacao?> GetBookingById(int id)
    {
        return await _context.Marcacoes
            .Include(m => m.Cliente).Include(m => m.Profissional)
            .Include(m => m.Servico).Include(m => m.Negocio)
            .FirstOrDefaultAsync(m => m.Id == id);
    }

    public async Task<IEnumerable<Marcacao>> GetBookingsByBusiness(int businessId)
    {
        return await _context.Marcacoes
            .Where(m => m.NegocioId == businessId)
            .Include(m => m.Cliente).Include(m => m.Profissional)
            .Include(m => m.Servico).Include(m => m.Negocio)
            .OrderByDescending(m => m.DataHoraInicio).ToListAsync();
    }

    public async Task<IEnumerable<Marcacao>> GetBookingsByClient(int clientId)
    {
        return await _context.Marcacoes
            .Where(m => m.ClienteId == clientId)
            .Include(m => m.Profissional).Include(m => m.Servico).Include(m => m.Negocio)
            .OrderByDescending(m => m.DataHoraInicio).ToListAsync();
    }

    public async Task<IEnumerable<Marcacao>> GetBookingsByProfessional(int professionalId)
    {
        return await _context.Marcacoes
            .Where(m => m.ProfissionalId == professionalId)
            .Include(m => m.Cliente).Include(m => m.Servico).Include(m => m.Negocio)
            .OrderByDescending(m => m.DataHoraInicio).ToListAsync();
    }

    public async Task<bool> UpdateBookingStatus(int id, StatusMarcacao status)
    {
        var booking = await GetBookingById(id);
        if (booking == null) return false;
        booking.Estado = status;
        await _context.SaveChangesAsync();
        return true;
    }
}
