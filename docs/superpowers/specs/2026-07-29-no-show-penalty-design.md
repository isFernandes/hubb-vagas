# Design Spec: Item 12.9 - Política de Cancelamento (No-Show) com Punição

## Goal
Implementar um sistema de moderação de faltas (No-Show) justo e auditável, punindo profissionais ausentes com uma avaliação automática de 1 estrela e, em caso de recorrência (3 faltas), suspendendo a conta.

## Architecture
1. **Database Schema:**
   - Adicionar o campo `defenseDescription String?` no modelo `Report` (Prisma) para o envio de defesa do candidato.
2. **Backend Dispute Process:**
   - Criação da denúncia: `POST /reports` cria um relatório no status `PENDING`.
   - Envio da Defesa: `PATCH /reports/:id/defense` salva a justificativa do candidato e atualiza o status para `INVESTIGATING`.
   - Moderação Admin: `POST /admin/reports/:id/resolve` permite ao admin rejeitar a denúncia (`DISMISSED`) ou aprová-la (`RESOLVED`).
3. **No-Show Penalty execution:**
   - Ao aprovar uma denúncia de No-Show, cria-se uma `Review` com nota `1` na candidatura respectiva.
   - Caso o candidato some 3 ou mais relatórios `RESOLVED` de tipo `NO_SHOW`, o status de sua conta (`Account`) é alterado para `SUSPENDED` e um log é criado em `AccountAuditLog`.

## Proposed Changes
- [schema.prisma](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/infra/prisma/schema.prisma): Adicionar campo `defenseDescription` no modelo `Report`.
- [reports.service.ts](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/reports/reports.service.ts): Lógica de criação de relatório, envio de defesa e checagem de regras de no-show.
- [admin.service.ts](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/admin/admin.service.ts): Fluxo de resolução de denúncia com geração automática de review e controle de suspensão (3 no-shows).
- [JobDetails.tsx](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/web/src/pages/company/JobDetails.tsx): Botão e modal para reportar no-show.
- [Settings.tsx](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/web/src/pages/candidate/Settings.tsx): Painel de defesa de denúncias para o candidato.
- [Moderation.tsx](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/web/src/pages/admin/Moderation.tsx): Visualização consolidada de denúncia vs defesa para tomada de decisão pelo admin.

## Verification
- Teste unitário para validar se o envio de defesa só é permitido ao candidato denunciado.
- Teste unitário de resolução de no-show verificando se a review de 1 estrela é de fato injetada na candidatura.
- Teste de integração verificando se o acúmulo de 3 faltas gera suspensão automática do perfil.
