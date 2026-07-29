# Design Spec: Improvement 2.2 - Assessments e Quizzes

## Goal
Implementar um sistema de triagem rápida contendo até 4 perguntas curtas de múltipla escolha associadas a uma vaga. Os candidatos devem responder a estas perguntas durante o processo de candidatura, e suas respostas e pontuações serão exibidas para as empresas sem bloquear candidaturas por notas baixas.

## Architecture
1. **Modelagem de Banco de Dados:**
   - Adicionar os modelos `Quiz` (relação 1:1 com `Job`) e `Question` (relação 1:N com `Quiz`).
   - Adicionar `scorePercentage Int?` e `quizAnswers Json?` ao modelo `Application` (Prisma).
2. **Validações e Restrições (Backend):**
   - Limite máximo de **4 perguntas** por `Quiz`.
   - Limite de tamanho de texto: Pergunta (máx. 120 caracteres), Alternativas (máx. 60 caracteres).
   - O serviço de candidatura calcula a pontuação comparando as respostas enviadas com o gabarito das perguntas cadastradas.
3. **Frontend Integrations:**
   - Tela de criação de vagas permite adicionar perguntas de triagem rápidas.
   - Candidatos respondem ao questionário em formato modal antes de consolidar a candidatura.
   - Visualização de porcentagem de acertos e respostas exatas no painel de detalhes do candidato da empresa.

## Proposed Changes
- [schema.prisma](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/infra/prisma/schema.prisma): Adicionar modelos `Quiz`, `Question` e propriedades na tabela `Application`.
- [applications.service.ts](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/applications/applications.service.ts): Lógica de cálculo e armazenamento do score no `apply`.
- [NewJob.tsx](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/web/src/pages/company/NewJob.tsx): Interface de formulário para criação das perguntas de triagem.
- [JobDetailsCandidate.tsx](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/web/src/pages/candidate/JobDetailsCandidate.tsx): Modal de resposta de triagem antes de confirmar a aplicação.
- [JobDetails.tsx](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/web/src/pages/company/JobDetails.tsx): Exibir score de acertos e detalhes das respostas no card do candidato.

## Verification
- Testes unitários para validar limites de tamanho de perguntas e limite máximo de 4 no backend.
- Teste unitário para validar cálculo correto de pontuações de gabarito.
