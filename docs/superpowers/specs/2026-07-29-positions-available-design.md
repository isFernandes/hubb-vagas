# Design Spec: Item 12.7 - Vagas Múltiplas (positionsAvailable)

## Goal
Permitir que vagas suportem múltiplas contratações. A vaga só deve ser finalizada e os demais candidatos rejeitados quando todas as posições disponíveis forem preenchidas.

## Architecture
1. **Database Schema:**
   - Adicionar campo `positionsAvailable Int @default(1)` na tabela `Job` (Prisma).
2. **Backend Validation:**
   - `CreateJobDto` e `UpdateJobDto` validados via Zod.
   - Restringir atualizações de `positionsAvailable` para valores maiores ou iguais ao número de contratações aprovadas atuais.
   - Fechar a vaga caso o número de vagas seja atualizado para o total de contratações existentes.
3. **Closure Logic:**
   - O worker assíncrono `JobClosureWorker` contará as candidaturas com status `APPROVED` para a vaga.
   - Se `approvedCount + 1 >= positionsAvailable`, o status da vaga muda para `CLOSED_HIRED` e os demais candidatos ativos são rejeitados.
   - Caso contrário, a vaga permanece `PUBLISHED` e apenas o candidato atual é marcado como `APPROVED`.

## Proposed Changes
- [schema.prisma](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/infra/prisma/schema.prisma): Adicionar campo `positionsAvailable`.
- [create-job.dto.ts](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/jobs/dto/create-job.dto.ts): Adicionar `positionsAvailable` opcional com fallback.
- [jobs.service.ts](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/jobs/jobs.service.ts): Validação de contagem ao atualizar `positionsAvailable`.
- [job-closure.worker.ts](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/jobs/job-closure.worker.ts): Lógica de encerramento baseada em contagem de contratações.
- [NewJob.tsx](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/web/src/pages/company/NewJob.tsx): Input para quantidade de vagas no formulário de criação.
- [JobDetails.tsx](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/web/src/pages/company/JobDetails.tsx): Exibir quantidade de vagas e contador de contratações.

## Verification
- Testes unitários para validação de alteração do número de vagas no `JobsService`.
- Teste unitário/integração simulando duas contratações para vaga com 2 posições no `JobClosureWorker`.
