namespace Booker.Core.DTOs;

public class ReviewCreateDto
{
    public int NegocioId { get; set; }
    public int Pontuacao { get; set; }
    public string Comentario { get; set; } = string.Empty;
}
