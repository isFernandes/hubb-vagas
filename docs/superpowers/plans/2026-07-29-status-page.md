# Improvement 6.2: Status Page Pública Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a public health status page (e.g. status.hubbvagas.com or `/status`) that displays real-time health metrics of all critical infrastructure components, using a 30 seconds cache mechanism on the backend.

**Architecture:**
1. Backend: Implement health endpoints `/health` using NestJS Terminus library checking database connection, redis ping, rabbitmq responsiveness, and free memory.
2. Caching: Save results in the memory of the `HealthController` for 30 seconds to prevent query abuse.
3. Frontend: Create a public, beautiful status interface fetching state from `/health` and rendering status indicators.

**Tech Stack:** NestJS (@nestjs/terminus), React

---

### Task 1: Health Check Endpoint with 30s Caching

**Files:**
- Create: `apps/api/src/infra/health/health.controller.ts`
- Create: `apps/api/src/infra/health/health.module.ts`

**Interfaces:**
- Consumes: Database, Redis, RabbitMQ health state.
- Produces: JSON health state representation.

- [ ] **Step 1: Implement health checks with cache**

Create `health.controller.ts` exposing GET `/health` with local variable checking timestamp delta. If delta < 30 seconds, return cached response.

- [ ] **Step 2: Commit**

```bash
git add apps/api/src/infra/health/
git commit -m "feat: implement public health endpoints via NestJS Terminus with 30s caching"
```

---

### Task 2: Public Status Page UI

**Files:**
- Create: `apps/web/src/pages/StatusPage.tsx`
- Modify: `apps/web/src/App.tsx` (routing)

**Interfaces:**
- Consumes: Health status JSON.
- Produces: Status UI elements.

- [ ] **Step 1: Create StatusPage component**

Design a glassmorphism dashboard showing health cards for API, Database, cache, and messaging queue. Add system status text alerts.

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/pages/StatusPage.tsx
git commit -m "feat: add public status page UI in frontend"
```
