namespace Booker.Core.Entities;

public class Favorito
{
    public int Id { get; set; }
    public int UtilizadorId { get; set; }
    public Utilizador? Utilizador { get; set; }
    public int NegocioId { get; set; }
    public Negocio? Negocio { get; set; }
}
