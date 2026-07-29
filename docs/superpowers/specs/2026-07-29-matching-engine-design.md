# Design Spec: Improvement 2.1 - Motor de Matching (Matching Engine)

## Goal
Implementar um motor de matching (afinidade) inteligente que calcula e ordena candidatos para uma vaga específica com base em critérios de localidade, tipo de contrato, similaridade de palavras-chave, reputação geral e histórico de bicos bem-sucedidos em setores correlatos.

## Architecture
1. **Banco de Dados (Prisma):**
   - Adicionar o enum `CompanyCategory` (`RESTAURANT`, `CONSTRUCTION`, `EVENTS`, `RETAIL`, `LOGISTICS`, `GENERAL_SERVICES`, `OTHER`).
   - Adicionar a propriedade `category CompanyCategory @default(OTHER)` ao modelo `Company`.
   - Adicionar a propriedade `category CompanyCategory?` ao modelo `Job`.
2. **Fórmula de Cálculo de Afinidade (0% a 100%):**
   - **Similaridade Textual (Até 40%):** Proximidade de termos da bio/competências com a descrição da vaga.
   - **Compatibilidade Operacional (Até 30%):** 15% para localização coincidente e 15% para compatibilidade de preferência de tipo de contrato.
   - **Reputação Geral (Até 10%):** Baseado nas estrelas (`averageRating`) do candidato.
   - **Histórico no Setor/Palavra-Chave (Até 20%):** Candidatos ganham boost de +10% por bico avaliado com sucesso no mesmo segmento de vaga (mesma categoria) ou +5% por bicos que possuam termos de título semelhantes.
3. **Endpoints & Listagens:**
   - GET `/jobs/:id/matching` calcula em tempo real as notas e retorna ordenadas por maior score para o painel de moderação de candidatos.

## Proposed Changes
- [schema.prisma](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/infra/prisma/schema.prisma): Adicionar o enum `CompanyCategory` e o campo `category` em Company e Job.
- [matching.service.ts](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/jobs/matching.service.ts): [NEW] Algoritmo de cruzamento composto de notas de afinidade.
- [jobs.controller.ts](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/jobs/jobs.controller.ts): Expor endpoint `/jobs/:id/matching`.
- [JobDetails.tsx](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/web/src/pages/company/JobDetails.tsx): Badge visual de afinidade em porcentagem ordenando a listagem.
- [Settings.tsx](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/web/src/pages/company/Settings.tsx): Seleção de categoria do ramo no cadastro da empresa.

## Verification
- Teste unitário para validar cada componente da nota composto do `MatchingService`.
- Teste de integração simulando boosts de histórico por categoria coincidente.
