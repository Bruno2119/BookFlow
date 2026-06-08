namespace Booker.Core.Entities;

public class Servico
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
    public decimal Preco { get; set; }
    public int DuracaoMinutos { get; set; }

    public int NegocioId { get; set; }
    public Negocio? Negocio { get; set; }

    // Navigation properties
    public ICollection<Marcacao> Marcacoes { get; set; } = new List<Marcacao>();
}
