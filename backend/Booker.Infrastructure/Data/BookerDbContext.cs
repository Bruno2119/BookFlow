using Booker.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace Booker.Infrastructure.Data;

public class BookerDbContext : DbContext
{
    public BookerDbContext(DbContextOptions<BookerDbContext> options) : base(options)
    {
    }

    public DbSet<Utilizador> Utilizadores { get; set; }
    public DbSet<Negocio> Negocios { get; set; }
    public DbSet<Servico> Servicos { get; set; }
    public DbSet<Marcacao> Marcacoes { get; set; }
    public DbSet<Produto> Produtos { get; set; }
    public DbSet<Fatura> Faturas { get; set; }
    public DbSet<Disponibilidade> Disponibilidades { get; set; }
    public DbSet<Favorito> Favoritos { get; set; }
    public DbSet<Avaliacao> Avaliacoes { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure relationships and constraints

        modelBuilder.Entity<Avaliacao>()
            .HasOne(a => a.Utilizador)
            .WithMany()
            .HasForeignKey(a => a.UtilizadorId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Avaliacao>()
            .HasOne(a => a.Negocio)
            .WithMany(n => n.Avaliacoes)
            .HasForeignKey(a => a.NegocioId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Favorito>()
            .HasOne(f => f.Utilizador)
            .WithMany(u => u.Favoritos)
            .HasForeignKey(f => f.UtilizadorId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Favorito>()
            .HasOne(f => f.Negocio)
            .WithMany()
            .HasForeignKey(f => f.NegocioId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Marcacao>()
            .HasOne(m => m.Cliente)
            .WithMany(u => u.MarcacoesComoCliente)
            .HasForeignKey(m => m.ClienteId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Marcacao>()
            .HasOne(m => m.Profissional)
            .WithMany(u => u.MarcacoesComoProfissional)
            .HasForeignKey(m => m.ProfissionalId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Marcacao>()
            .HasOne(m => m.Negocio)
            .WithMany(n => n.Marcacoes)
            .HasForeignKey(m => m.NegocioId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Marcacao>()
            .HasOne(m => m.Servico)
            .WithMany(s => s.Marcacoes)
            .HasForeignKey(m => m.ServicoId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Marcacao>()
            .Property(m => m.PrecoAplicado)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Servico>()
            .Property(s => s.Preco)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Produto>()
            .Property(p => p.PrecoVenda)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Fatura>()
            .Property(f => f.ValorTotal)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Disponibilidade>()
            .HasOne(d => d.Profissional)
            .WithMany(u => u.Disponibilidades)
            .HasForeignKey(d => d.ProfissionalId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
