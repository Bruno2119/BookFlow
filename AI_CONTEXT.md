# AI Project Context: Website Booker

Este documento serve como a "memória mestre" para inteligências artificiais compreenderem a arquitetura, o estado atual e a visão futura do projeto **Website Booker**.

## 🎯 Visão do Projeto
O **Website Booker** é uma plataforma SaaS (Software as a Service) simplificada para pequenos negócios (barbeiros, salões de beleza, estúdios de tatuagem, etc.) gerirem os seus agendamentos, equipa e faturação. Foi construído sobre a fundação técnica robusta do projeto "Ent'Artes", adaptando o domínio de "escola de artes" para "gestão de serviços".

---

## 🏗️ Arquitetura Técnica

### Backend (.NET 10)
*   **Padrão**: Layered Architecture (API -> Core <- Infrastructure).
*   **Core**: Contém as entidades de domínio, enums e definições de interfaces.
*   **Infrastructure**: Implementa o acesso a dados via EF Core e a lógica pesada dos serviços.
*   **API**: Controladores REST protegidos por JWT.
*   **Segurança**: Hashing de senhas com BCrypt e Autorização baseada em Roles (`ADMIN`, `PROFISSIONAL`, `CLIENTE`).

### Frontend (React 19)
*   **Tech Stack**: Vite, TypeScript, TailwindCSS, Shadcn UI.
*   **UI/UX**: Estética Premium baseada no projeto "Ent'Artes" (Playfair Display + Inter, Sombras suaves, Cards modernos).
*   **Navegação**: Sidebar dinâmica e Dashboard centralizado.

---

## 📊 Modelo de Dados (Mapping)
| Entidade | Propósito |
| :--- | :--- |
| `Utilizador` | Identidade única com níveis de acesso. |
| `Negocio` | O estabelecimento físico (ex: Barbearia Central). |
| `Servico` | O que é vendido. Define preço e duração. |
| `Disponibilidade` | **(Novo)** Horários de trabalho semanais e exceções (DataEspecifica). |
| `Marcacao` | Agendamentos realizados. |
| `Produto` | Itens de inventário para venda direta. |
| `Fatura` | Documentos de faturamento. |

---

## 🚀 Estado Atual (Versão 1.1 - Maio 2026)
1.  **Disponibilidade Dinâmica**: Implementado sistema onde profissionais definem os seus horários de trabalho. O sistema calcula slots livres em tempo real.
2.  **Marketplace de Negócios**: Criada página de listagem de negócios para clientes com barra de pesquisa e cards visuais.
3.  **Fluxo de Reserva Inteligente**: Processo passo-a-passo (Serviço -> Profissional -> Data/Hora) com bloqueio de slots passados e prevenção de sobreposições.
4.  **UI Profissional**: Implementada Sidebar fixa com navegação por roles e Dashboard com estatísticas e atividade recente.
5.  **Ajuste de Roles**: Resolvido bug de identificação de utilizadores tipo '3' (Client mapping).

---

## 🔮 Visão de Futuro (Roadmap)

### Fase 1: Dashboards & Agenda
*   **Agenda Visual**: Implementar vista de calendário mensal para profissionais.
*   **Gestão de Exceções**: Interface para barbeiros fecharem datas específicas (feriados/férias).

### Fase 2: Experiência do Cliente
*   **Área Pessoal**: Aba "Minhas Marcações" para consulta e cancelamento.
*   **Notificações**: Alertas automáticos via browser ou email.

### Fase 3: Financeiro
*   **Faturação**: Geração de faturas reais com base nos serviços concluídos.
*   **Pagamentos**: Integração com gateways de pagamento.

---

## 🧠 Instruções para o Próximo Agente IA
*   **Estética**: Respeita rigorosamente as variáveis de cor e fontes no `index.css`. Mantém o contraste alto para visibilidade.
*   **Roles**: Trata utilizadores com `tipo` 0, 2 ou 3 como pertencentes ao fluxo de cliente conforme a lógica em `App.tsx`.
*   **Backend**: Lógica de slots reside exclusivamente no `BookingService`.
*   **Dates**: Ao enviar agendamentos, usa o formato `yyyy-MM-dd'T'HH:mm:ss`.

---
*Atualizado em 25 de Maio de 2026 após implementação do Marketplace e Agenda Dinâmica.*
