namespace Booker.Core.DTOs;

public class AdminStatsDto
{
    public int TotalUtilizadores { get; set; }
    public int TotalNegocios { get; set; }
    public int TotalMarcacoes { get; set; }
    public decimal FaturacaoTotal { get; set; }
    public List<RecentActivityDto> AtividadesRecentes { get; set; } = new();
}

public class BusinessStatsDto
{
    public int TotalMarcacoes { get; set; }
    public int MarcacoesHoje { get; set; }
    public decimal FaturacaoMensal { get; set; }
    public List<TopServiceDto> TopServicos { get; set; } = new();
    public List<EmployeePerformanceDto> PerformanceEquipa { get; set; } = new();
}

public class RecentActivityDto
{
    public string Descricao { get; set; } = string.Empty;
    public DateTime Data { get; set; }
    public string Tipo { get; set; } = string.Empty;
}

public class TopServiceDto
{
    public string Nome { get; set; } = string.Empty;
    public int Quantidade { get; set; }
    public decimal Total { get; set; }
}

public class EmployeePerformanceDto
{
    public string Nome { get; set; } = string.Empty;
    public int TotalMarcacoes { get; set; }
    public decimal Faturacao { get; set; }
}
