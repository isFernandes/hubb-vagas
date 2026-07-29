# Feature Implementation Tracker

Este documento serve para acompanhar o progresso da implementação de cada uma das novas funcionalidades do sistema de vagas, na ordem de prioridade técnica recomendada.

## Como Usar com Superpowers
Quando iniciar a codificação, você pode orientar o agente a ler este rastreador, abrir o plano de implementação do respectivo item e marcar as caixas de seleção (`- [ ]` para `- [x]`) correspondentes à medida que as tarefas forem concluídas e verificadas.

---

## Tabela de Progresso Geral

| Prioridade | Funcionalidade | Arquivo do Plano | Status |
|---|---|---|---|
| 1 | **Item 12.7: Vagas Múltiplas** | [Ver Plano](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/plans/2026-07-29-positions-available.md) | [ ] Não Iniciado |
| 2 | **Item 12.10: Conflito de Agenda** | [Ver Plano](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/plans/2026-07-29-schedule-conflict-validator.md) | [ ] Não Iniciado |
| 3 | **Item 12.11: Busca por Geolocalização** | [Ver Plano](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/plans/2026-07-29-geolocation-search.md) | [ ] Não Iniciado |
| 4 | **Item 12.9: Política de Cancelamento (No-Show)** | [Ver Plano](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/plans/2026-07-29-no-show-penalty.md) | [ ] Não Iniciado |
| 5 | **Item 14.1: Fila de Espera / Reservas** | [Ver Plano](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/plans/2026-07-29-waiting-list.md) | [ ] Não Iniciado |
| 6 | **Item 13.5: Gestão Financeira e Disputas** | [Ver Plano](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/plans/2026-07-29-financial-management-disputes.md) | [ ] Não Iniciado |

---

## Detalhamento das Funcionalidades

### 1. Item 12.7: Vagas Múltiplas (`positionsAvailable`)
*   **Status:** [ ] Não Iniciado
*   **Design Spec:** [2026-07-29-positions-available-design.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/specs/2026-07-29-positions-available-design.md)
*   **Plano de Implementação:** [2026-07-29-positions-available.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/plans/2026-07-29-positions-available.md)
*   **Tarefas Principais:**
    - [ ] Task 1: Database Migration (`positionsAvailable`)
    - [ ] Task 2: DTO and Service Validation in `JobsService`
    - [ ] Task 3: `JobClosureWorker` Refactor to support count checks
    - [ ] Task 4: Frontend inputs in `NewJob.tsx` and counts display in `JobDetails.tsx`

### 2. Item 12.10: Validador de Conflito de Agenda
*   **Status:** [ ] Não Iniciado
*   **Design Spec:** [2026-07-29-schedule-conflict-validator-design.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/specs/2026-07-29-schedule-conflict-validator-design.md)
*   **Plano de Implementação:** [2026-07-29-schedule-conflict-validator.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/plans/2026-07-29-schedule-conflict-validator.md)
*   **Tarefas Principais:**
    - [ ] Task 1: Database Migration (`executionDate`, `durationHours`)
    - [ ] Task 2: Service Validation Logic in `ApplicationsService.apply` (1h buffer check)
    - [ ] Task 3: Automatic cancellation of overlapping pending applications in `JobClosureWorker`
    - [ ] Task 4: Frontend datetime inputs, job card details, and helper warnings

### 3. Item 12.11: Busca por Geolocalização (Raio de Atuação)
*   **Status:** [ ] Não Iniciado
*   **Design Spec:** [2026-07-29-geolocation-search-design.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/specs/2026-07-29-geolocation-search-design.md)
*   **Plano de Implementação:** [2026-07-29-geolocation-search.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/plans/2026-07-29-geolocation-search.md)
*   **Tarefas Principais:**
    - [ ] Task 1: Database Migration (`latitude`, `longitude` on User and Job)
    - [ ] Task 2: Repository raw query integration with Haversine formula in PostgreSQL
    - [ ] Task 3: Fallback Nominatim backend `GeocodingService`
    - [ ] Task 4: Frontend autocomplete addresses, browser GPS filters

### 4. Item 12.9: Política de Cancelamento (No-Show) com Punição
*   **Status:** [ ] Não Iniciado
*   **Design Spec:** [2026-07-29-no-show-penalty-design.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/specs/2026-07-29-no-show-penalty-design.md)
*   **Plano de Implementação:** [2026-07-29-no-show-penalty.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/plans/2026-07-29-no-show-penalty.md)
*   **Tarefas Principais:**
    - [ ] Task 1: Database Migration (`defenseDescription` in `Report`)
    - [ ] Task 2: Add validation for creating no-show reports in `ReportsService`
    - [ ] Task 3: Defense submittals in `PATCH /reports/:id/defense`
    - [ ] Task 4: Admin resolution logic generating 1-star penalty reviews and automatic suspensions (3 infractions)
    - [ ] Task 5: Frontend company reporting controls, candidate defense dashboard, and admin moderation views

### 5. Item 14.1: Fila de Espera / Reservas (Standby)
*   **Status:** [ ] Não Iniciado
*   **Design Spec:** [2026-07-29-waiting-list-design.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/specs/2026-07-29-waiting-list-design.md)
*   **Plano de Implementação:** [2026-07-29-waiting-list.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/plans/2026-07-29-waiting-list.md)
*   **Tarefas Principais:**
    - [ ] Task 1: Database Migration (`STANDBY` application status, `enableStandby` on `Job`)
    - [ ] Task 2: Standby Promotion Service logic (SCREENING status promotion and job reopening)
    - [ ] Task 3: Conditional conversion of pending candidates to standby in `JobClosureWorker`
    - [ ] Task 4: Frontend standby enable checkboxes and standby candidates queue views

### 6. Item 13.5: Gestão Financeira e Disputas
*   **Status:** [ ] Não Iniciado
*   **Design Spec:** [2026-07-29-financial-management-disputes-design.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/specs/2026-07-29-financial-management-disputes-design.md)
*   **Plano de Implementação:** [2026-07-29-financial-management-disputes.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/plans/2026-07-29-financial-management-disputes.md)
*   **Tarefas Principais:**
    - [ ] Task 1: Database Migration (`Transaction` model and status enum)
    - [ ] Task 2: Webhook ledger recording and fee calculations in cents
    - [ ] Task 3: Dispute endpoints and admin resolution logic (Release / Refund options)
    - [ ] Task 4: Settlement Cron Job to finalize escrow after 24h
    - [ ] Task 5: Admin financial dashboard and dispute moderation page, company dispute buttons
