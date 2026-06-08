# Relatório Técnico: Website Booker - Sistema SaaS de Agendamentos e Gestão
**Projeto no Âmbito da Unidade Curricular de LESI - 2º Ano**
**Ano Letivo 2025/2026**

---

## Resumo Executivo
O **Website Booker** é uma plataforma SaaS (Software as a Service) desenvolvida para colmatar a lacuna digital em pequenos negócios de serviços (barbearias, estúdios, salões). O sistema permite a gestão multi-negócio, onde cada estabelecimento pode gerir a sua própria equipa, serviços, agenda dinâmica e faturação. Utilizando tecnologias de última geração como **.NET 10** e **React 19**, a solução foca-se na escalabilidade, segurança e numa experiência de utilizador (UX) fluida e moderna.

---

## 1. Introdução

### 1.1. Contexto e Motivação
No cenário atual, a digitalização deixou de ser um luxo para se tornar uma necessidade. Muitos pequenos negócios ainda dependem de agendas de papel ou sistemas fragmentados. O Booker nasce da necessidade de centralizar estas operações numa única plataforma robusta, permitindo que o prestador de serviços se foque no seu trabalho enquanto o sistema trata da logística.

### 1.2. O Problema
A gestão manual de marcações leva frequentemente a:
*   Conflitos de horários (overbooking).
*   Esquecimento de marcações por parte dos clientes (no-shows).
*   Dificuldade no cálculo de faturação mensal e gestão de stock.
*   Falta de visibilidade online para novos clientes.

### 1.3. A Solução: Website Booker
A solução proposta é uma aplicação web completa que oferece:
1.  **Portal de Cliente:** Onde utilizadores podem descobrir negócios, ver serviços e agendar slots disponíveis em tempo real.
2.  **Painel de Negócio:** Ferramenta administrativa para proprietários e profissionais gerirem as suas agendas e vendas.
3.  **Motor de Disponibilidade:** Algoritmo que calcula automaticamente janelas de tempo livre baseadas na duração dos serviços e horário dos funcionários.

---

## 2. Análise de Requisitos

### 2.1. Stakeholders (Atores do Sistema)
*   **Administrador Global:** Gere a plataforma SaaS, novos negócios e configurações de sistema.
*   **Proprietário de Negócio:** Gere o seu estabelecimento, equipa de profissionais e produtos.
*   **Profissional:** Gere a sua própria agenda, confirma serviços realizados e consulta o seu histórico.
*   **Cliente:** Reserva serviços, compra produtos no marketplace e consulta o seu histórico de faturas.

### 2.2. Requisitos Funcionais (RF)
*   **RF01 - Gestão de Autenticação:** Registo, login e gestão de perfil com Refresh Tokens.
*   **RF02 - Multi-Tenancy:** Cada negócio deve ter dados isolados e branding próprio.
*   **RF03 - Agenda Dinâmica:** O sistema deve gerar slots de agendamento baseados na `Disponibilidade` configurada e durações de `Servico`.
*   **RF04 - Marketplace:** Gestão de inventário e venda de produtos físicos associados ao negócio.
*   **RF05 - Faturação Automática:** Geração de documento de fatura após a conclusão de uma marcação ou venda.
*   **RF06 - Gestão de Equipa:** O proprietário pode adicionar/remover profissionais e atribuir-lhes permissões.

### 2.3. Requisitos Não Funcionais (RNF)
*   **RNF01 - Segurança:** Comunicação via HTTPS, hashing de passwords e autorização baseada em Roles.
*   **RNF02 - Disponibilidade:** O sistema deve estar operacional 99.9% do tempo.
*   **RNF03 - Responsividade:** A interface deve ser adaptável a dispositivos móveis.
*   **RNF04 - Performance:** O motor de slots deve processar a agenda semanal em menos de 200ms.

---

## 3. Arquitetura e Design

### 3.1. Stack Tecnológica
*   **Backend:** C# .NET 10 (ASP.NET Core Web API).
*   **ORM:** Entity Framework Core com SQL Server.
*   **Frontend:** React 19, TypeScript, Vite.
*   **Estilização:** TailwindCSS e Shadcn UI (Radix UI).
*   **Estado Frontend:** TanStack Query e Context API.

### 3.2. Padrões de Arquitetura
O backend utiliza uma **Arquitetura por Camadas (Layered Architecture)**:
1.  **Core:** Entidades de domínio e interfaces (agnóstico a tecnologia externa).
2.  **Infrastructure:** Acesso à base de dados, serviços de terceiros (email, pagamentos).
3.  **API:** Controladores REST e DTOs para comunicação externa.

### 3.3. Modelo de Dados (Principais Entidades)
*   **Utilizador:** `Id, Nome, Email, PasswordHash, Role, NegocioId`.
*   **Negocio:** `Id, Nome, Endereco, Contacto, NIF`.
*   **Servico:** `Id, Nome, Descricao, Duracao(min), Preco`.
*   **Disponibilidade:** `Id, ProfissionalId, DiaSemana, HoraInicio, HoraFim`.
*   **Marcacao:** `Id, ClienteId, ProfissionalId, ServicoId, DataHora, Status`.
*   **Produto:** `Id, Nome, Preco, Stock, NegocioId`.
*   **Fatura:** `Id, DataEmissao, ValorTotal, ClienteId, Pago`.

---

## 4. Implementação Detalhada

### 4.1. O Motor de Agendamento
Diferente de sistemas escolares, o Booker não usa horários fixos. O sistema:
1.  Obtém o horário de trabalho do profissional para o dia X.
2.  Obtém todas as `Marcacoes` já confirmadas para esse dia.
3.  Calcula os intervalos vazios (gaps).
4.  Se a duração do `Servico` pretendido for <= ao gap, o slot é exibido ao cliente.

### 4.2. Segurança e Autorização
A segurança é baseada em **JWT (JSON Web Tokens)**. Ao fazer login, o utilizador recebe um `AccessToken` (curta duração) e um `RefreshToken` (longa duração).
A autorização é feita via políticas (Policies):
*   `[Authorize(Roles = "Admin")]`: Acesso total.
*   `[Authorize(Roles = "Profissional")]`: Acesso à própria agenda.

### 4.3. Interface do Utilizador (UX)
A interface foi desenhada para ser limpa e profissional.
*   **Dashboard:** Visão geral de ganhos e próximas marcações.
*   **Modo Escuro/Claro:** Suporte nativo via Tailwind.
*   **Feedback Visual:** Uso de `Sonner` para notificações e `Framer Motion` para transições suaves.

---

## 5. Qualidade e Testes

### 5.1. Testes Unitários
Implementados em xUnit, focando-se na lógica do `BookingService` para garantir que slots não se sobrepõem.

### 5.2. Testes de Integração
Utilização de `InMemoryDatabase` para testar os repositórios e a persistência de dados sem necessidade de um SQL Server real em ambiente de desenvolvimento.

---

## 6. Conclusão e Trabalhos Futuros

### 6.1. Balanço Final
O projeto Booker cumpre todos os requisitos de uma plataforma SaaS moderna. A transição do domínio de escola para serviços foi um sucesso técnico, provando que uma boa arquitetura permite a reutilização e adaptação de código de forma eficiente.

### 6.2. Evoluções Futuras
*   Integração com gateways de pagamento (Stripe/Multibanco).
*   Envio de lembretes automáticos via WhatsApp/SMS.
*   Aplicação móvel nativa (React Native ou Flutter).

---
**Fim do Relatório**
