namespace Booker.Core.Entities;

public class Negocio
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Endereco { get; set; } = string.Empty;
    public string Telefone { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
    public string Categoria { get; set; } = string.Empty;
    public string ImagemUrl { get; set; } = string.Empty;
    public string? HorariosJson { get; set; } // Armazenamento robusto em JSON

    // Navigation properties
    public ICollection<Servico> Servicos { get; set; } = new List<Servico>();
    public ICollection<Utilizador> Funcionarios { get; set; } = new List<Utilizador>();
    public ICollection<Marcacao> Marcacoes { get; set; } = new List<Marcacao>();
    public ICollection<Avaliacao> Avaliacoes { get; set; } = new List<Avaliacao>();
}
