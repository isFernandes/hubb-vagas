# Design Spec: Improvement 6.2 - Status Page Pública

## Goal
Implementar uma página pública de status (/status) que permite a qualquer visitante visualizar a saúde operacional em tempo real da infraestrutura crítica da plataforma (API, Banco de Dados, Cache Redis, RabbitMQ e uso de memória).

## Architecture
1. **Endpoint de Saúde (NestJS Terminus):**
   - Rota pública `GET /health` sem autenticação.
   - Integra checagem de conexão do Prisma, Redis, RabbitMQ e limite de consumo de memória Heap.
2. **Mecanismo de Cache de 30 Segundos:**
   - O `HealthController` armazena em memória interna a resposta da última checagem de saúde e o timestamp correspondente.
   - Requisições que ocorrem num intervalo menor que 30 segundos do último ping recebem a resposta do cache, mitigando sobrecargas.
3. **Status Page UI:**
   - Nova rota pública `/status` no frontend React.
   - Design responsivo exibindo o status de cada serviço e um indicador de integridade principal (Verde/Amarelo/Vermelho) com aviso de taxa de atualização de cache.

## Proposed Changes
- [health.controller.ts](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/infra/health/health.controller.ts): [NEW] Expor endpoint de saúde Terminus com cache de 30 segundos em memória.
- [health.module.ts](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/infra/health/health.module.ts): [NEW] Módulo de saúde registrando os providers.
- [StatusPage.tsx](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/web/src/pages/StatusPage.tsx): [NEW] Tela pública de status do sistema.
- [App.tsx](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/web/src/App.tsx): Adicionar rota `/status` pública.

## Verification
- Teste de integração chamando a rota `/health` repetidas vezes no intervalo de 30 segundos e validando que o timestamp do cálculo de saúde permanece inalterado (prova da atuação do cache).
- Teste manual do carregamento visual do indicador de status.
