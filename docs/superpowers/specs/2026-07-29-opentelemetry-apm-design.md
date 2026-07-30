# Design Spec: Improvement 6.1 - OpenTelemetry (APM) Tracing

## Goal
Implementar rastreamento distribuído (APM Tracing) no backend NestJS utilizando o ecossistema OpenTelemetry para monitorar fluxos de dados, gargalos e latência entre requisições HTTP, banco de dados Postgres (Prisma), cache Redis e RabbitMQ.

## Architecture
1. **Inicialização Antecipada:**
   - Criar arquivo `instrumentation.ts` importado na primeira linha do `main.ts` para garantir a interceptação de imports e injeção do OpenTelemetry antes do carregamento dos módulos do framework.
2. **Auto-instrumentações:**
   - Habilitar auto-instrumentações padrão para:
     - `http` / `express` (requisições recebidas).
     - `pg` / Prisma (queries de banco de dados).
     - `ioredis` / Redis (operações de cache).
     - `amqplib` (RabbitMQ broker).
3. **Exportador Resiliente:**
   - Configurar o `OTLPTraceExporter` apontando para o endpoint OTLP gRPC/HTTP do Jaeger.
   - **Mecanismo de Fallback:** Caso a variável `OTEL_EXPORTER_OTLP_ENDPOINT` esteja vazia, desativar silenciosamente o exportador ou utilizar o `SimpleSpanProcessor` com `ConsoleSpanExporter` em modo debug, garantindo que o servidor suba sem problemas de conexão em desenvolvimento local.

## Proposed Changes
- [instrumentation.ts](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/instrumentation.ts): [NEW] Configuração e inicialização do OpenTelemetry Node SDK.
- [main.ts](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/main.ts): Importar o script de instrumentação no topo do arquivo.

## Verification
- Teste manual validando que o backend inicializa sem erros com e sem a variável do coletor configurada.
- Verificar logs do console em modo debug exibindo spans formatados.
