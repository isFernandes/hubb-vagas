# Design Spec: Item 14.1 - Fila de Espera / Reservas (Standby)

## Goal
Permitir que empresas ativem uma fila de espera para suas vagas. Se habilitada, o preenchimento da última vaga converte os demais candidatos em "Standby". Se houver desistência ou No-Show do contratado, o sistema promove automaticamente o primeiro da fila.

## Architecture
1. **Database Schema:**
   - Adicionar `STANDBY` ao enum `ApplicationStatus` (Prisma).
   - Adicionar a coluna `enableStandby Boolean @default(false)` no modelo `Job` (Prisma).
2. **Standby Conversion Logic:**
   - No `JobClosureWorker`, ao atingir a capacidade máxima de contratações:
     - Se `enableStandby` for `true`, atualiza os candidatos `APPLIED`/`SCREENING` restantes para `STANDBY`.
     - Se for `false`, atualiza para `REJECTED`.
3. **Standby Promotion Logic:**
   - Ao registrar desistência ou No-Show, busca a candidatura `STANDBY` mais antiga (`createdAt ASC`).
   - Se existir, altera seu status para `APPROVED` e emite evento de notificação.
   - Se não existir, altera o status da vaga de volta para `PUBLISHED` para reabertura de novas inscrições públicas.

## Proposed Changes
- [schema.prisma](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/infra/prisma/schema.prisma): Adicionar `STANDBY` no enum e `enableStandby` em `Job`.
- [job-closure.worker.ts](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/jobs/job-closure.worker.ts): Inserir conversão condicional para standby ao fechar a vaga.
- [admin.service.ts](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/admin/admin.service.ts): Integrar chamada de promoção de standby ao aplicar punição de no-show.
- [standby-promotion.service.ts](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/applications/standby-promotion.service.ts): [NEW] Serviço central de promoção automática e reabertura de vagas.
- [NewJob.tsx](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/web/src/pages/company/NewJob.tsx): Checkbox no formulário para habilitar standby.
- [JobDetails.tsx](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/web/src/pages/company/JobDetails.tsx): Visualização estruturada da fila de reserva.

## Verification
- Teste de integração verificando se candidatos mudam de pendente para `STANDBY` sob a flag ativada.
- Teste unitário certificando promoção automática ordenada por `createdAt`.
- Teste de reabertura automática de vaga caso a fila de standby esteja vazia.
