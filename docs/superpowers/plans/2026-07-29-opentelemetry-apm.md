# Improvement 6.1: OpenTelemetry (APM) Tracing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate OpenTelemetry APM to instrument trace flows across NestJS HTTP requests, Postgres database updates, Redis caching, and RabbitMQ message brokers.

**Architecture:**
1. Setup an `instrumentation.ts` file initialized at main application boot (before any modules are loaded).
2. Configure OpenTelemetry Node SDK with auto-instrumentations for HTTP, PG, Redis, and AMQPLib, exporting traces to Jaeger/collector via OTLP.

**Tech Stack:** NestJS, @opentelemetry/sdk-node, Jaeger, RabbitMQ

---

### Task 1: OpenTelemetry Initialization

**Files:**
- Create: `apps/api/src/instrumentation.ts`
- Modify: `apps/api/src/main.ts`

**Interfaces:**
- Consumes: OTLP collector endpoint.
- Produces: Traces instrumentation.

- [ ] **Step 1: Write instrumentation setup**

Create `apps/api/src/instrumentation.ts`:
```typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({ url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
```

- [ ] **Step 2: Bootstrap in main.ts**

Import `instrumentation.ts` at the very first line of `apps/api/src/main.ts`.

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/instrumentation.ts
git commit -m "feat: initialize OpenTelemetry APM node sdk tracing"
```
