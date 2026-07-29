# Design Spec: Item 12.10 - Validador de Conflito de Agenda

## Goal
Evitar que candidatos tenham conflitos de horários entre bicos (gigs) diferentes, garantindo um intervalo mínimo de 1 hora de descanso/deslocamento entre as atividades contratadas.

## Architecture
1. **Database Schema:**
   - Adicionar os campos `executionDate DateTime?` e `durationHours Int?` na tabela `Job` (Prisma).
2. **Backend Validation:**
   - Tornar `executionDate` e `durationHours` obrigatórios em `CreateJobDto`.
   - Ao se candidatar em `ApplicationsService.apply`, verificar se o candidato possui algum bico no status `APPROVED` cujo horário coincida ou tenha menos de 1 hora de intervalo do bico alvo.
   - Fórmula de conflito com 1h (3600000ms) de buffer:
     `conflito = (novoInicio < jaAprovadoFim + 1h) && (jaAprovadoInicio < novoFim + 1h)`
3. **Automatic Rejection:**
   - No `JobClosureWorker`, após aprovar um candidato para uma vaga, buscar as demais candidaturas ativas dele (`APPLIED`, `SCREENING`) em outras vagas e rejeitar automaticamente aquelas que passarem a conflitar de horário com o bico aprovado.
4. **UX Helpers:**
   - Exibir na criação da vaga recomendações sobre pausas para alimentação dinamicamente baseadas na duração selecionada.

## Proposed Changes
- [schema.prisma](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/infra/prisma/schema.prisma): Adicionar campos de execução e duração.
- [create-job.dto.ts](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/jobs/dto/create-job.dto.ts): Tornar os campos obrigatórios na validação Zod de criação.
- [applications.service.ts](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/applications/applications.service.ts): Lógica de validação de conflito de agenda no `apply`.
- [job-closure.worker.ts](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/jobs/job-closure.worker.ts): Rejeição automática de candidaturas conflitantes pendentes do contratado.
- [NewJob.tsx](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/web/src/pages/company/NewJob.tsx): Campos de data/duração e helper text dinâmico de intervalo de alimentação.

## Verification
- Teste unitário para validar conflitos de horários em `ApplicationsService`.
- Teste unitário para certificar que candidaturas com horários livres passam com sucesso.
- Teste de integração do cancelamento assíncrono de candidaturas concorrentes no worker.
