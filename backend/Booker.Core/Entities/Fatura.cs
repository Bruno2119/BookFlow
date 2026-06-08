namespace Booker.Core.Entities;

public class Fatura
{
    public int Id { get; set; }
    public int Mes { get; set; }
    public int Ano { get; set; }
    public DateTime DataEmissao { get; set; }
    public decimal ValorTotal { get; set; }
    public bool Paga { get; set; }

    public int ClienteId { get; set; }
    public Utilizador? Cliente { get; set; }

    public ICollection<Marcacao> Marcacoes { get; set; } = new List<Marcacao>();
}
