using System.Text.Json.Serialization;

namespace Booker.Core.DTOs;

public class BusinessHourUpdateDto
{
    [JsonPropertyName("diaSemana")]
    public int DiaSemana { get; set; }

    [JsonPropertyName("horaAbertura")]
    public string HoraAbertura { get; set; } = "09:00:00";

    [JsonPropertyName("horaFecho")]
    public string HoraFecho { get; set; } = "18:00:00";

    [JsonPropertyName("estaAberto")]
    public bool EstaAberto { get; set; }
}
