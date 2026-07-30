# Design Spec: Improvement 4.3 - Analytics de Recrutamento

## Goal
Implementar métricas de inteligência de recrutamento (Time-to-Hire e funil de conversão) e funcionalidade de exportação de dados em CSV para avaliação de performance de contratação pelas empresas.

## Architecture
1. **Definição de Métricas:**
   - **Time-to-Hire Médio:** Tempo médio entre `Job.createdAt` e as respectivas aprovações de candidatura (`status === 'APPROVED'`), ponderado pela quantidade de posições preenchidas.
   - **Funil de Conversão (Drop-off):** Mapeamento do número de candidatos que avançaram de `APPLIED` -> `SCREENING` -> `STANDBY` -> `APPROVED` vs rejeitados.
2. **Exportação CSV:**
   - Rota `GET /companies/analytics/export` gera um stream de texto CSV contendo o histórico consolidado de vagas (vagas, contratações, candidatos, datas e Time-to-Hire).
3. **Frontend Analytics Page:**
   - Interface com cartões de KPI e gráficos de funil utilizando elementos CSS/SVG nativos ou biblioteca de gráficos. Botão de exportação de CSV.

## Proposed Changes
- [analytics.controller.ts](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/companies/analytics.controller.ts): [NEW] Expor relatórios financeiros/métricas e exportação de CSV.
- [analytics.service.ts](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/companies/analytics.service.ts): [NEW] Agregador contendo fórmulas de Time-to-Hire médio e dados do funil.
- [Analytics.tsx](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/web/src/pages/company/Analytics.tsx): [NEW] Página visual de KPIs e funil com botão de download.

## Verification
- Teste unitário para validar fórmula de Time-to-Hire médio ponderado por vaga.
- Teste de integração da conversão do layout CSV no controller.
