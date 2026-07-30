# Improvement 6.3: Métricas em Tempo Real (Prometheus/Grafana) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expose a `/metrics` Prometheus endpoint in the NestJS API to track server stats (latency, request counts, queue lengths, memory usage) for visualization on Grafana.

**Architecture:**
1. Setup a middleware that intercepts incoming HTTP requests to track status codes and latency.
2. Initialize prometheus metrics (histograms, counters) using `prom-client`.
3. Expose a public GET `/metrics` endpoint returning plain text formatting for Prometheus scrape nodes.

**Tech Stack:** NestJS, prom-client NPM package, Prometheus, Grafana

---

### Task 1: Prometheus Metrics Controller and Middleware

**Files:**
- Create: `apps/api/src/infra/metrics/metrics.controller.ts`
- Create: `apps/api/src/infra/metrics/metrics.middleware.ts`
- Create: `apps/api/src/infra/metrics/metrics.module.ts`

**Interfaces:**
- Consumes: HTTP request durations and payloads.
- Produces: Prometheus-scrape formatted `/metrics` payload.

- [ ] **Step 1: Track requests using prom-client**

Implement middleware registering request duration histograms:
```typescript
const httpRequestDurationMicroseconds = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in microseconds',
  labelNames: ['method', 'route', 'code'],
});
```

- [ ] **Step 2: Expose prometheus metrics endpoint**

Create metrics controller returning:
```typescript
@Get()
async getMetrics(@Response() res) {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/infra/metrics/
git commit -m "feat: expose prometheus metrics integration in NestJS API"
```
