namespace Booker.Core.Entities;

public class Produto
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
    public decimal PrecoVenda { get; set; }
    public int Stock { get; set; }
    public bool Ativo { get; set; }

    public int? ContribuidorId { get; set; }
    public Utilizador? Contribuidor { get; set; }
}
