# Design Spec: Item 14.1 - Fila de Espera / Reservas (Standby)

## Goal
Permitir que empresas ativem uma fila de espera para suas vagas. Se habilitada, o preenchimento da última vaga converte os demais candidatos em "Standby". Se houver desistência ou No-Show do contratado, a vaga reabre e o primeiro da fila de espera é promovido para análise (`SCREENING`), notificando a empresa para fazer a aprovação e pagamento manual.

## Architecture
1. **Database Schema:**
   - Adicionar `STANDBY` ao enum `ApplicationStatus` (Prisma).
   - Adicionar a coluna `enableStandby Boolean @default(false)` no modelo `Job` (Prisma).
2. **Standby Conversion Logic:**
   - No `JobClosureWorker`, ao atingir a capacidade máxima de contratações:
     - Se `enableStandby` for `true`, atualiza os candidatos `APPLIED`/`SCREENING` restantes para `STANDBY`.
     - Se for `false`, atualiza para `REJECTED`.
3. **Standby Promotion Logic (Sem Aprovação Automática):**
   - Ao registrar desistência ou No-Show, o status da vaga retorna para `PUBLISHED`.
   - O sistema busca a candidatura `STANDBY` mais antiga (`createdAt ASC`) para aquela vaga.
   - Se existir, altera seu status de `STANDBY` para `SCREENING` (Em Análise) e emite evento de notificação para a empresa: *"Vaga reaberta. O candidato reserva X foi movido para análise para sua aprovação manual."*
   - Se não existir, a vaga apenas reabre como `PUBLISHED` sem outras alterações de status.

## Proposed Changes
- [schema.prisma](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/infra/prisma/schema.prisma): Adicionar `STANDBY` no enum e `enableStandby` em `Job`.
- [job-closure.worker.ts](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/jobs/job-closure.worker.ts): Inserir conversão condicional para standby ao fechar a vaga.
- [admin.service.ts](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/admin/admin.service.ts): Integrar chamada de promoção de standby ao aplicar punição de no-show.
- [standby-promotion.service.ts](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/applications/standby-promotion.service.ts): [NEW] Serviço central de promoção para `SCREENING` e reabertura de vagas.
- [NewJob.tsx](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/web/src/pages/company/NewJob.tsx): Checkbox no formulário para habilitar standby.
- [JobDetails.tsx](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/web/src/pages/company/JobDetails.tsx): Visualização estruturada da fila de reserva e botão para aprovar e pagar candidato promovido.

## Verification
- Teste de integração verificando se candidatos mudam de pendente para `STANDBY` sob a flag ativada.
- Teste unitário de promoção para `SCREENING` ordenada por `createdAt` e emissão de notificação para a empresa.
- Teste de reabertura da vaga como `PUBLISHED`.
