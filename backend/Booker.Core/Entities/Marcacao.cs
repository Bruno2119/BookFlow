using Booker.Core.Enums;

namespace Booker.Core.Entities;

public class Marcacao
{
    public int Id { get; set; }
    public DateTime DataHoraInicio { get; set; }
    public DateTime DataHoraFim { get; set; }
    public StatusMarcacao Estado { get; set; }
    public decimal PrecoAplicado { get; set; }

    public int ClienteId { get; set; }
    public Utilizador? Cliente { get; set; }

    public int ProfissionalId { get; set; }
    public Utilizador? Profissional { get; set; }

    public int ServicoId { get; set; }
    public Servico? Servico { get; set; }

    public int NegocioId { get; set; }
    public Negocio? Negocio { get; set; }

    public int? FaturaId { get; set; }
    public Fatura? Fatura { get; set; }
}
