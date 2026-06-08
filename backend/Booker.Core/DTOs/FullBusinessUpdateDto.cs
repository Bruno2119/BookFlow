using System.Text.Json.Serialization;

namespace Booker.Core.DTOs;

public class FullBusinessUpdateDto
{
    public string Nome { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
    public string Endereco { get; set; } = string.Empty;
    public string Telefone { get; set; } = string.Empty;
    public string Categoria { get; set; } = string.Empty;
    public string ImagemUrl { get; set; } = string.Empty;

    public List<BusinessHourUpdateDto> Horarios { get; set; } = new List<BusinessHourUpdateDto>();
}
