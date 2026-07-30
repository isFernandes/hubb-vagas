# Design Spec: Improvement 3.3 - Agendamento do Bico no Calendário

## Goal
Agendar automaticamente o horário de execução do bico (`executionDate` e `durationHours`) no Google Calendar do candidato e da empresa após a aprovação da candidatura (pagamento aprovado).

## Architecture
1. **Banco de Dados (Prisma):**
   - Adicionar os campos `googleRefreshToken String?` e `googleEmail String?` no modelo `Account`.
   - Adicionar `calendarEventId String?` no modelo `Application`.
2. **Integração OAuth2:**
   - Implementar rota de login Google OAuth2 para autorização de escopo de escrita do Calendar (`https://www.googleapis.com/auth/calendar.events`).
3. **Agendamento no Encerramento de Vaga:**
   - No `JobClosureWorker`, após aprovar um candidato, carregar o token e criar o evento de calendário com o horário do bico, adicionando o e-mail do candidato e da empresa como participantes. Salvar o ID do evento retornado no banco de dados.
4. **Sincronização:**
   - Se o horário ou duração do bico for editado, o sistema localiza os eventos correspondentes via `calendarEventId` e atualiza no Google Calendar.
   - Fornecer botão "Sincronizar Calendário" na interface como ação de contingência.

## Proposed Changes
- [schema.prisma](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/infra/prisma/schema.prisma): Adicionar colunas de tokens e IDs de evento.
- [google-oauth.controller.ts](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/auth/google-oauth.controller.ts): [NEW] Callback e fluxo de consentimento de calendário.
- [calendar-scheduler.service.ts](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/companies/calendar-scheduler.service.ts): [NEW] Integração com googleapis para criação/edição de eventos de bicos.
- [job-closure.worker.ts](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/jobs/job-closure.worker.ts): Disparar criação de evento ao aprovar a vaga.
- [Settings.tsx](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/web/src/pages/candidate/Settings.tsx): Botão para login Google OAuth.
- [JobDetails.tsx](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/web/src/pages/company/JobDetails.tsx): Ação para sincronização manual do calendário.

## Verification
- Teste unitário certificando que a chamada da API do Google Calendar formata a data e hora em UTC.
- Teste de integração do fluxo de consentimento OAuth e renovação de token.
