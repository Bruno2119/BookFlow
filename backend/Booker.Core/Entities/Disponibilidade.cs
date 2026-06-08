namespace Booker.Core.Entities;

public class Disponibilidade
{
    public int Id { get; set; }
    public int ProfissionalId { get; set; }
    public Utilizador? Profissional { get; set; }
    public DayOfWeek DiaSemana { get; set; }
    public DateTime? DataEspecifica { get; set; }
    public TimeSpan HoraInicio { get; set; }
    public TimeSpan HoraFim { get; set; }
    public bool Ativo { get; set; } = true;
}
