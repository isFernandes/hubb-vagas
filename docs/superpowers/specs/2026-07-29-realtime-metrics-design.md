# Design Spec: Improvement 6.3 - Métricas em Tempo Real (Prometheus/Grafana)

## Goal
Expor um endpoint `/metrics` protegido no backend NestJS no formato exigido pelo Prometheus, permitindo rastreio contínuo de volumetria de requisições, latências, erro 5xx e contadores de negócios.

## Architecture
1. **Biblioteca prom-client:**
   - Inicializar e expor métricas padrão do sistema (NodeJS CPU, heap memory, loop delays, GC events) via `prom-client.collectDefaultMetrics()`.
2. **Métricas Customizadas:**
   - `http_requests_total` (counter contendo labels `method`, `route`, `status_code`).
   - `http_request_duration_seconds` (histogram contendo labels `method`, `route` com percentis de latência).
   - `active_jobs_total` (gauge com a contagem total de vagas com status `PUBLISHED`).
3. **Segurança (Basic Auth Guard):**
   - A rota `GET /metrics` será protegida por um guard de autenticação básica `BasicAuthGuard`.
   - As credenciais de acesso serão verificadas contra as variáveis `PROMETHEUS_USER` e `PROMETHEUS_PASS` declaradas no `.env`.

## Proposed Changes
- [metrics.controller.ts](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/infra/metrics/metrics.controller.ts): [NEW] Expor a rota `/metrics` sob o guard `BasicAuthGuard` retornando dados do `prom-client` registry.
- [metrics.middleware.ts](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/infra/metrics/metrics.middleware.ts): [NEW] Middleware global que intercepta as chamadas HTTP para alimentar os contadores e histogramas de latência.
- [metrics.module.ts](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/infra/metrics/metrics.module.ts): [NEW] Configuração inicial e injeção do middleware.
- [basic-auth.guard.ts](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/guards/basic-auth.guard.ts): [NEW] Guard reutilizável de Basic Auth.

## Verification
- Teste unitário certificando que chamadas para `/metrics` sem cabeçalho de autorização básico correto retornam erro 401 Unauthorized.
- Teste de integração do middleware validando incremento correto dos contadores HTTP.
