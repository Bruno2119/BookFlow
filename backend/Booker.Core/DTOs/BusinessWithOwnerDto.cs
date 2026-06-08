using Booker.Core.Entities;

namespace Booker.Core.DTOs;

public class BusinessWithOwnerDto
{
    // Business info
    public string NomeNegocio { get; set; } = string.Empty;
    public string Endereco { get; set; } = string.Empty;
    public string TelefoneNegocio { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
    public string Categoria { get; set; } = string.Empty;
    public string ImagemUrl { get; set; } = string.Empty;

    // Owner info
    public string NomeDono { get; set; } = string.Empty;
    public string EmailDono { get; set; } = string.Empty;
    public string PasswordDono { get; set; } = string.Empty;
}
