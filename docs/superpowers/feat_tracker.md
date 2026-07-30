# Feature Implementation Tracker

Este documento serve para acompanhar o progresso da implementação de cada uma das novas funcionalidades do sistema de vagas, na ordem de prioridade técnica recomendada.

## Como Usar com Superpowers
Quando iniciar a codificação, você pode orientar o agente a ler este rastreador, abrir o plano de implementação do respectivo item e marcar as caixas de seleção (`- [ ]` para `- [x]`) correspondentes à medida que as tarefas forem concluídas e verificadas.

---

## Tabela de Progresso Geral

| Prioridade | Funcionalidade | Arquivo do Plano | Status |
|---|---|---|---|
| 1 | **Item 12.7: Vagas Múltiplas** | [Ver Plano](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/plans/2026-07-29-positions-available.md) | [x] Concluído |
| 2 | **Item 12.10: Conflito de Agenda** | [Ver Plano](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/plans/2026-07-29-schedule-conflict-validator.md) | [x] Concluído |
| 3 | **Item 12.11: Busca por Geolocalização** | [Ver Plano](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/plans/2026-07-29-geolocation-search.md) | [x] Concluído |
| 4 | **Item 12.9: Política de Cancelamento (No-Show)** | [Ver Plano](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/plans/2026-07-29-no-show-penalty.md) | [x] Concluído |
| 5 | **Item 14.1: Fila de Espera / Reservas** | [Ver Plano](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/plans/2026-07-29-waiting-list.md) | [x] Concluído |
| 6 | **Item 13.5: Gestão Financeira e Disputas** | [Ver Plano](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/plans/2026-07-29-financial-management-disputes.md) | [x] Concluído |

---

## Detalhamento das Funcionalidades

### 1. Item 12.7: Vagas Múltiplas (`positionsAvailable`)
*   **Status:** [x] Concluído
*   **Design Spec:** [2026-07-29-positions-available-design.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/specs/2026-07-29-positions-available-design.md)
*   **Plano de Implementação:** [2026-07-29-positions-available.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/plans/2026-07-29-positions-available.md)
*   **Tarefas Principais:**
    - [x] Task 1: Database Migration (`positionsAvailable`)
    - [x] Task 2: DTO and Service Validation in `JobsService`
    - [x] Task 3: `JobClosureWorker` Refactor to support count checks
    - [x] Task 4: Frontend inputs in `NewJob.tsx` and counts display in `JobDetails.tsx`

### 2. Item 12.10: Validador de Conflito de Agenda
*   **Status:** [x] Concluído
*   **Design Spec:** [2026-07-29-schedule-conflict-validator-design.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/specs/2026-07-29-schedule-conflict-validator-design.md)
*   **Plano de Implementação:** [2026-07-29-schedule-conflict-validator.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/plans/2026-07-29-schedule-conflict-validator.md)
*   **Tarefas Principais:**
    - [x] Task 1: Database Migration (`executionDate`, `durationHours`)
    - [x] Task 2: Service Validation Logic in `ApplicationsService.apply` (1h buffer check)
    - [x] Task 3: Automatic cancellation of overlapping pending applications in `JobClosureWorker`
    - [x] Task 4: Frontend datetime inputs, job card details, and helper warnings

### 3. Item 12.11: Busca por Geolocalização (Raio de Atuação)
*   **Status:** [x] Concluído
*   **Design Spec:** [2026-07-29-geolocation-search-design.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/specs/2026-07-29-geolocation-search-design.md)
*   **Plano de Implementação:** [2026-07-29-geolocation-search.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/plans/2026-07-29-geolocation-search.md)
*   **Tarefas Principais:**
    - [x] Task 1: Database Migration (`latitude`, `longitude` on User and Job)
    - [x] Task 2: Repository raw query integration with Haversine formula in PostgreSQL
    - [x] Task 3: Fallback Nominatim backend `GeocodingService` (Not applicable, coordinates supplied by frontend)
    - [x] Task 4: Frontend autocomplete addresses, browser GPS filters

### 4. Item 12.9: Política de Cancelamento (No-Show) com Punição
*   **Status:** [x] Concluído
*   **Design Spec:** [2026-07-29-no-show-penalty-design.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/specs/2026-07-29-no-show-penalty-design.md)
*   **Plano de Implementação:** [2026-07-29-no-show-penalty.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/plans/2026-07-29-no-show-penalty.md)
*   **Tarefas Principais:**
    - [x] Task 1: No-Show Report Handler API validations
    - [x] Task 2: Admin Resolution & Auto-Review Penalty logic (with auto-suspension)
    - [x] Task 3: Frontend Administration & Reporting Buttons in Modals`PATCH /reports/:id/defense`
    - [x] Task 4: Admin resolution logic generating 1-star penalty reviews and automatic suspensions (3 infractions)
    - [x] Task 5: Frontend company reporting controls, candidate defense dashboard, and admin moderation views

### 5. Item 14.1: Fila de Espera / Reservas (Standby)
*   **Status:** [x] Concluído
*   **Design Spec:** [2026-07-29-waiting-list-design.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/specs/2026-07-29-waiting-list-design.md)
*   **Plano de Implementação:** [2026-07-29-waiting-list.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/plans/2026-07-29-waiting-list.md)
*   **Tarefas Principais:**
    - [x] Task 1: Database Updates (Status and Job config)
    - [x] Task 2: Service Logic for Standby Promotion & Job Reopening
    - [x] Task 3: Hook Standby Conversion on Job Closure Worker
    - [x] Task 4: Frontend Toggle and Standby Views

### 6. Item 13.5: Gestão Financeira e Disputas
*   **Status:** [x] Concluído
*   **Design Spec:** [2026-07-29-financial-management-disputes-design.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/specs/2026-07-29-financial-management-disputes-design.md)
*   **Plano de Implementação:** [2026-07-29-financial-management-disputes.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/plans/2026-07-29-financial-management-disputes.md)
*   **Tarefas Principais:**
    - [x] Task 1: Database Migration (`Transaction` model and status enum)
    - [x] Task 2: Webhook ledger recording and fee calculations in cents
    - [x] Task 3: Dispute endpoints and admin resolution logic (Release / Refund options)
    - [x] Task 4: Settlement Cron Job to finalize escrow after 24h
    - [x] Task 5: Admin financial dashboard and dispute moderation page, company dispute buttons
