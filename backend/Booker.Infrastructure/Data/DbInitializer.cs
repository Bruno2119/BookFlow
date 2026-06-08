using Booker.Core.Entities;
using Booker.Core.Enums;
using Microsoft.EntityFrameworkCore;

namespace Booker.Infrastructure.Data;

public static class DbInitializer
{
    public static async Task InitializeAsync(BookerDbContext context)
    {
        await context.Database.EnsureCreatedAsync();

        if (await context.Utilizadores.AnyAsync()) return;

        // Seed Negocio
        var negocio = new Negocio
        {
            Nome = "Barbearia Central",
            Endereco = "Rua Principal, 123",
            Telefone = "912345678",
            Descricao = "A melhor barbearia da cidade.",
            Categoria = "Barbearia",
            ImagemUrl = "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=800&auto=format&fit=crop"
        };
        context.Negocios.Add(negocio);
        await context.SaveChangesAsync();

        // Seed Admin
        var admin = new Utilizador
        {
            Nome = "Admin Booker",
            Email = "admin@booker.pt",
            SenhaHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
            Tipo = TipoUtilizador.ADMIN
        };

        // Seed Professional (Linked to Negocio)
        var professional = new Utilizador
        {
            Nome = "Barbeiro João",
            Email = "joao@barbearia.pt",
            SenhaHash = BCrypt.Net.BCrypt.HashPassword("prof123"),
            Tipo = TipoUtilizador.PROFISSIONAL,
            NegocioId = negocio.Id
        };

        // Seed Cliente
        var cliente = new Utilizador
        {
            Nome = "Cliente Teste",
            Email = "cliente@exemplo.com",
            SenhaHash = BCrypt.Net.BCrypt.HashPassword("123456"),
            Tipo = TipoUtilizador.CLIENTE
        };

        context.Utilizadores.AddRange(admin, professional, cliente);
        await context.SaveChangesAsync();

        // Seed Servicos
        var servicos = new List<Servico>
        {
            new Servico { Nome = "Corte de Cabelo", Descricao = "Corte clássico", Preco = 15.00m, DuracaoMinutos = 30, NegocioId = negocio.Id },
            new Servico { Nome = "Barba", Descricao = "Aparar e delinear", Preco = 10.00m, DuracaoMinutos = 20, NegocioId = negocio.Id },
            new Servico { Nome = "Combo", Descricao = "Cabelo + Barba", Preco = 22.00m, DuracaoMinutos = 50, NegocioId = negocio.Id }
        };
        context.Servicos.AddRange(servicos);
        await context.SaveChangesAsync();
    }
}
