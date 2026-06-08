using Booker.Core.Enums;

namespace Booker.Core.Entities;

public class Utilizador
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string SenhaHash { get; set; } = string.Empty;
    public TipoUtilizador Tipo { get; set; }
    public string? Bio { get; set; }
    public string? Especialidades { get; set; }

    public int? NegocioId { get; set; }
    public Negocio? Negocio { get; set; }

    // Navigation properties
    public ICollection<Marcacao> MarcacoesComoProfissional { get; set; } = new List<Marcacao>();
    public ICollection<Marcacao> MarcacoesComoCliente { get; set; } = new List<Marcacao>();
    public ICollection<Fatura> Faturas { get; set; } = new List<Fatura>();
    public ICollection<Produto> ProdutosContribuidos { get; set; } = new List<Produto>();
    public ICollection<Disponibilidade> Disponibilidades { get; set; } = new List<Disponibilidade>();
    public ICollection<Favorito> Favoritos { get; set; } = new List<Favorito>();
}
