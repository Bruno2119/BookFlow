# Relatório de Projeto: Website Booker (Plataforma SaaS)

## 1. Introdução
O **Website Booker** é uma solução SaaS (Software as a Service) concebida para modernizar a gestão de pequenos negócios baseados em agendamentos, como barbearias, salões de estética e estúdios de tatuagem. 

Originalmente baseado num sistema de gestão escolar, o projeto foi totalmente reestruturado para suportar múltiplos estabelecimentos (**Negócios**), permitindo que cada proprietário gira a sua equipa, serviços e agenda de forma autónoma.

## 2. Objetivos do Sistema
*   **Gestão de Agendamentos Dinâmicos:** Sistema de slots em tempo real baseado na disponibilidade dos profissionais.
*   **Multi-Tenancy:** Capacidade de alojar vários negócios independentes na mesma plataforma.
*   **Faturação Automatizada:** Geração de faturas simplificada após a prestação dos serviços.
*   **Marketplace Integrado:** Venda de produtos complementares aos serviços prestados.

## 3. Arquitetura Técnica
O sistema segue uma arquitetura moderna e escalável:
*   **Backend:** ASP.NET Core (.NET 10) utilizando *Layered Architecture*.
    *   `Booker.Core`: Entidades de domínio e lógica de negócio.
    *   `Booker.Infrastructure`: Persistência com EF Core e SQL Server.
    *   `Booker.API`: Endpoints REST protegidos por JWT.
*   **Frontend:** React 19 com Vite, TypeScript e TailwindCSS.
    *   Interface baseada em **Shadcn UI** para uma experiência premium e responsiva.

## 4. Mapeamento de Domínio (Adaptação)
Para a transição do domínio de "Karate/Artes" para "SaaS/Serviços", foram efetuadas as seguintes alterações:

| Conceito Original (Karate) | Conceito Booker (SaaS) | Descrição |
| :--- | :--- | :--- |
| Escola / Dojo | **Negócio** | O estabelecimento que presta os serviços. |
| Sensei / Professor | **Profissional** | O colaborador que executa o serviço e tem agenda própria. |
| Aluno / Encarregado | **Cliente** | O utilizador final que reserva os serviços. |
| Aula / Sessão | **Marcação** | O agendamento de um serviço específico. |
| Graduação / Exame | **Serviço** | O tipo de trabalho prestado (ex: Corte de Cabelo). |
| Mensalidade | **Fatura** | Documento relativo ao pagamento de serviços ou produtos. |

## 5. Funcionalidades Principais
### 5.1. Gestão de Disponibilidade
Ao contrário de horários fixos de aulas, o Booker utiliza um motor de **Disponibilidade Dinâmica**. Cada profissional define os seus blocos horários, e o sistema calcula automaticamente os slots livres subtraindo as marcações já existentes.

### 5.2. Marketplace e Inventário
Permite que os negócios vendam produtos (ex: ceras, champôs) diretamente pela plataforma, com controlo de stock integrado na entidade `Produto`.

### 5.3. Faturação
Processo automatizado que consolida os serviços realizados e produtos vendidos numa `Fatura` final, garantindo o controlo financeiro do negócio.

## 6. Conclusão
O Website Booker evoluiu de um sistema de nicho para uma ferramenta versátil de gestão empresarial. A transição técnica garantiu que a robustez do código original fosse mantida, enquanto a nova interface e lógica de slots oferecem a flexibilidade necessária para o mercado de serviços atual.
