using Booker.Core.Entities;
using Booker.Core.Interfaces;
using Booker.Core.DTOs;
using Booker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Booker.Infrastructure.Services;

public class DisponibilidadeService : IDisponibilidadeService
{
    private readonly BookerDbContext _context;

    public DisponibilidadeService(BookerDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Disponibilidade>> GetByProfessional(int professionalId)
    {
        // 1. Obter Profissional e o Negócio
        var professional = await _context.Utilizadores
            .Include(u => u.Negocio)
            .FirstOrDefaultAsync(u => u.Id == professionalId);

        if (professional == null || professional.Negocio == null)
            return new List<Disponibilidade>();

        // 2. Obter apenas ALTERAÇÕES PONTUAIS (com DataEspecifica)
        // Removemos a dependência de horários semanais fixos do profissional para não bloquear o Dono.
        var overrides = await _context.Disponibilidades
            .Where(d => d.ProfissionalId == professionalId && d.DataEspecifica.HasValue)
            .ToListAsync();

        // 3. Parse do Horário do Negócio (A fonte de verdade principal)
        var businessHours = new List<BusinessHourUpdateDto>();
        if (!string.IsNullOrEmpty(professional.Negocio.HorariosJson))
        {
            try {
                businessHours = JsonSerializer.Deserialize<List<BusinessHourUpdateDto>>(
                    professional.Negocio.HorariosJson, 
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new List<BusinessHourUpdateDto>();
            } catch { }
        }

        // 4. Construir a lista dinâmica (Sempre 7 dias)
        var dynamicList = new List<Disponibilidade>();

        for (int i = 0; i < 7; i++)
        {
            // O Dono manda no horário semanal.
            var bHour = businessHours.FirstOrDefault(bh => bh.DiaSemana == i);
            
            if (bHour != null)
            {
                dynamicList.Add(new Disponibilidade
                {
                    ProfissionalId = professionalId,
                    DiaSemana = (DayOfWeek)i,
                    HoraInicio = TimeSpan.Parse(bHour.HoraAbertura?.Split('.')[0] ?? "09:00:00"),
                    HoraFim = TimeSpan.Parse(bHour.HoraFecho?.Split('.')[0] ?? "18:00:00"),
                    Ativo = bHour.EstaAberto
                });
            }
            else
            {
                // Fallback de segurança (Seg-Sex aberto 9-18)
                dynamicList.Add(new Disponibilidade
                {
                    ProfissionalId = professionalId,
                    DiaSemana = (DayOfWeek)i,
                    HoraInicio = new TimeSpan(9, 0, 0),
                    HoraFim = new TimeSpan(18, 0, 0),
                    Ativo = i >= 1 && i <= 5
                });
            }
        }

        // 5. Adicionar as EXCEÇÕES PONTUAIS do profissional (Estas "escondem" o horário do dia específico)
        foreach (var dso in overrides)
        {
            dynamicList.Add(dso);
        }

        return dynamicList;
    }

    public async Task<Disponibilidade> Upsert(Disponibilidade availability)
    {
        // Só permitimos Upsert de alterações pontuais (com data) no calendário visual
        if (availability.DataEspecifica.HasValue)
        {
            var existing = await _context.Disponibilidades
                .FirstOrDefaultAsync(d => d.ProfissionalId == availability.ProfissionalId && 
                                        d.DataEspecifica.HasValue && 
                                        d.DataEspecifica.Value.Date == availability.DataEspecifica.Value.Date);

            if (existing != null)
            {
                existing.HoraInicio = availability.HoraInicio;
                existing.HoraFim = availability.HoraFim;
                existing.Ativo = availability.Ativo;
                _context.Disponibilidades.Update(existing);
                await _context.SaveChangesAsync();
                return existing;
            }
        }
        else
        {
            // Se for semanal, procuramos por dia da semana (Embora agora o Dono mande no semanal)
            var existing = await _context.Disponibilidades
                .FirstOrDefaultAsync(d => d.ProfissionalId == availability.ProfissionalId && 
                                        !d.DataEspecifica.HasValue && 
                                        d.DiaSemana == availability.DiaSemana);
            
            if (existing != null)
            {
                existing.HoraInicio = availability.HoraInicio;
                existing.HoraFim = availability.HoraFim;
                existing.Ativo = availability.Ativo;
                _context.Disponibilidades.Update(existing);
                await _context.SaveChangesAsync();
                return existing;
            }
        }

        _context.Disponibilidades.Add(availability);
        await _context.SaveChangesAsync();
        return availability;
    }

    public async Task<bool> Delete(int id)
    {
        var availability = await _context.Disponibilidades.FindAsync(id);
        if (availability == null) return false;

        _context.Disponibilidades.Remove(availability);
        await _context.SaveChangesAsync();
        return true;
    }
}
