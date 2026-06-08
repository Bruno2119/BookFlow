using System.ComponentModel.DataAnnotations;

namespace Booker.Core.Entities;

public class Avaliacao
{
    public int Id { get; set; }
    
    [Range(1, 5)]
    public int Pontuacao { get; set; }
    
    public string Comentario { get; set; } = string.Empty;
    
    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;

    public int UtilizadorId { get; set; }
    public Utilizador? Utilizador { get; set; }

    public int NegocioId { get; set; }
    public Negocio? Negocio { get; set; }
}
