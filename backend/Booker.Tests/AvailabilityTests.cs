using Booker.Core.Entities;
using Booker.Core.Enums;
using Booker.Infrastructure.Data;
using Booker.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Booker.Tests;

public class AvailabilityTests
{
    private BookerDbContext GetDbContext()
    {
        var options = new DbContextOptionsBuilder<BookerDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new BookerDbContext(options);
    }

    [Fact]
    public async Task GetAvailableSlots_ShouldRespectDynamicAvailability()
    {
        // Arrange
        var context = GetDbContext();
        var professionalId = 1;
        var serviceId = 1;
        var date = new DateTime(2026, 5, 25); // A Monday

        context.Servicos.Add(new Servico { Id = serviceId, Nome = "Corte", DuracaoMinutos = 30, Preco = 20 });
        
        // Dynamic availability: 14:00 to 16:00
        context.Disponibilidades.Add(new Disponibilidade 
        { 
            ProfissionalId = professionalId, 
            DiaSemana = DayOfWeek.Monday, 
            HoraInicio = new TimeSpan(14, 0, 0), 
            HoraFim = new TimeSpan(16, 0, 0), 
            Ativo = true 
        });

        await context.SaveChangesAsync();

        var service = new BookingService(context);

        // Act
        var slots = await service.GetAvailableSlots(professionalId, serviceId, date);

        // Assert
        // Expected slots: 14:00, 14:30, 15:00, 15:30 (last one ends at 16:00)
        Assert.Equal(4, slots.Count());
        Assert.Contains(date.AddHours(14), slots);
        Assert.Contains(date.AddHours(15).AddMinutes(30), slots);
        Assert.DoesNotContain(date.AddHours(9), slots);
        Assert.DoesNotContain(date.AddHours(17), slots);
    }

    [Fact]
    public async Task GetAvailableSlots_ShouldReturnEmpty_WhenNoAvailabilityDefined()
    {
        // Arrange
        var context = GetDbContext();
        var professionalId = 1;
        var serviceId = 1;
        var date = new DateTime(2026, 5, 26); // A Tuesday

        context.Servicos.Add(new Servico { Id = serviceId, Nome = "Corte", DuracaoMinutos = 30, Preco = 20 });
        // No availability added for Tuesday

        await context.SaveChangesAsync();

        var service = new BookingService(context);

        // Act
        var slots = await service.GetAvailableSlots(professionalId, serviceId, date);

        // Assert
        Assert.Empty(slots);
    }
}
