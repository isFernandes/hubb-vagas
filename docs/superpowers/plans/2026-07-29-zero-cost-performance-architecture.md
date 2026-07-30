# Zero-Cost & High-Performance Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement zero-cost infrastructure configurations and performance optimizations (HTTP Edge Caching, Selective Database Projections, Anti-Cold-Start ping, and documentation updates) for the Hubb Vagas platform.

**Architecture:** Use a NestJS Cache-Control interceptor for CDN Edge offloading, optimize Prisma `select` projections for lean JSON payloads, configure GitHub Actions workflow for keeping free containers awake, and update architectural documentation for Free-Tier deployments.

**Tech Stack:** NestJS, TypeScript, Prisma ORM, Vitest, GitHub Actions, Markdown.

## Global Constraints

- **Infrastructure Cost**: R$ 0,00 (100% Free Tier compatible).
- **Zero Breaking Changes**: Existing REST API contracts, routes, and responses must remain fully compatible.
- **TDD & Verification**: All code changes must include corresponding unit/integration tests running clean.

---

### Task 1: NestJS HTTP Edge Cache-Control Interceptor

**Files:**
- Create: `apps/api/src/common/interceptors/cache-control.interceptor.ts`
- Modify: `apps/api/src/jobs/jobs.controller.ts`
- Test: `apps/api/src/common/interceptors/cache-control.interceptor.spec.ts`

**Interfaces:**
- Consumes: `@nestjs/common` `NestInterceptor`, `ExecutionContext`, `CallHandler`
- Produces: `@CacheControl(options)` decorator and interceptor setting `Cache-Control` header on HTTP responses.

- [ ] **Step 1: Write the failing test for CacheControlInterceptor**

```typescript
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { describe, it, expect, vi } from 'vitest';
import { CacheControlInterceptor } from './cache-control.interceptor';

describe('CacheControlInterceptor', () => {
  it('should set Cache-Control header on response', async () => {
    const interceptor = new CacheControlInterceptor('public, max-age=60, s-maxage=300');
    const mockResponse = { setHeader: vi.fn() };
    const mockContext = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    } as unknown as ExecutionContext;
    const mockHandler: CallHandler = { handle: () => of({ data: 'ok' }) };

    await interceptor.intercept(mockContext, mockHandler).toPromise();

    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      'public, max-age=60, s-maxage=300',
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run apps/api/src/common/interceptors/cache-control.interceptor.spec.ts`
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Write minimal implementation for CacheControlInterceptor**

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class CacheControlInterceptor implements NestInterceptor {
  constructor(private readonly headerValue: string) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse();
    if (response && typeof response.setHeader === 'function') {
      response.setHeader('Cache-Control', this.headerValue);
    }
    return next.handle();
  }
}
```

- [ ] **Step 4: Apply Interceptor to JobsController GET routes**

In `apps/api/src/jobs/jobs.controller.ts`:
Add `@UseInterceptors(new CacheControlInterceptor('public, max-age=60, s-maxage=300, stale-while-revalidate=600'))` on public list and detail endpoints.

- [ ] **Step 5: Run tests and verify success**

Run: `npx vitest run apps/api/src/common/interceptors/cache-control.interceptor.spec.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/common/interceptors/ apps/api/src/jobs/jobs.controller.ts
git commit -m "feat(api): add HTTP Cache-Control interceptor for edge CDN acceleration"
```

---

### Task 2: Selective Prisma Query Projections

**Files:**
- Modify: `apps/api/src/repositories/prisma/prisma-jobs.repository.ts`
- Test: `apps/api/src/repositories/prisma/prisma-jobs.repository.spec.ts`

**Interfaces:**
- Consumes: PrismaClient `job.findMany`
- Produces: Optimized payload query returning lightweight job lists without full description payloads.

- [ ] **Step 1: Write test verifying selective field selection for job listings**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { PrismaJobsRepository } from './prisma-jobs.repository';

describe('PrismaJobsRepository Listing Projection', () => {
  it('should request lean fields during paginated list query', async () => {
    const mockPrisma = {
      job: {
        findMany: vi.fn().mockResolvedValue([]),
        count: vi.fn().mockResolvedValue(0),
      },
    };
    const repo = new PrismaJobsRepository(mockPrisma as any);
    await repo.findPublished({ page: 1, limit: 10 });

    expect(mockPrisma.job.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          id: true,
          title: true,
          status: true,
          companyId: true,
          createdAt: true,
        }),
      }),
    );
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npx vitest run apps/api/src/repositories/prisma/prisma-jobs.repository.spec.ts`
Expected: FAIL

- [ ] **Step 3: Update `findPublished` method in `PrismaJobsRepository` to use explicit `select`**

Update `findPublished` in `apps/api/src/repositories/prisma/prisma-jobs.repository.ts` to project essential fields only.

- [ ] **Step 4: Run test to verify success**

Run: `npx vitest run apps/api/src/repositories/prisma/prisma-jobs.repository.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/repositories/prisma/
git commit -m "perf(api): optimize Prisma job listing queries with lean select projections"
```

---

### Task 3: Anti-Cold-Start GitHub Actions Ping Workflow

**Files:**
- Create: `.github/workflows/keep-alive.yml`

**Interfaces:**
- Consumes: GitHub Actions Scheduled Cron (`schedule: '*/10 * * * *'`)
- Produces: Periodic HTTP GET to health check endpoint preventing Free-Tier server sleep.

- [ ] **Step 1: Create `.github/workflows/keep-alive.yml`**

```yaml
name: Keep Free Tier API Alive

on:
  schedule:
    # Run every 10 minutes to prevent Render/Koyeb free container sleep
    - cron: '*/10 * * * *'
  workflow_dispatch:

jobs:
  ping-health:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Health Endpoint
        run: |
          API_URL="${{ secrets.API_HEALTH_URL }}"
          if [ -n "$API_URL" ]; then
            echo "Pinging $API_URL..."
            curl -s -f "$API_URL" || echo "API ping failed or sleeping"
          else
            echo "API_HEALTH_URL secret not set. Skipping ping."
          fi
```

- [ ] **Step 2: Commit workflow**

```bash
git add .github/workflows/keep-alive.yml
git commit -m "ci: add GitHub Actions keep-alive ping workflow for free tier hosting"
```

---

### Task 4: Complete Free-Tier & Performance Documentation Update

**Files:**
- Modify: `docs/ARCHITECTURE.md`
- Modify: `architectureBP.MD`
- Modify: `GEMINI.MD`
- Modify: `.antigravity.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: Spec document `docs/superpowers/specs/2026-07-29-zero-cost-performance-architecture-design.md`
- Produces: Updated repository documentation describing Free-Tier (Managed + Oracle) setups and performance optimizations.

- [ ] **Step 1: Update `docs/ARCHITECTURE.md` with Zero-Cost Cloud Topology**
Add section detailing Vercel + Render + Neon + Upstash + CloudAMQP (100% free stack).

- [ ] **Step 2: Update `architectureBP.MD` and `GEMINI.MD`**
Include Free-Tier AWS alternatives and performance strategies (Edge Caching, Selective Projections).

- [ ] **Step 3: Update `.antigravity.md` and `README.md`**
Highlight Zero-Cost deployment capability and instant UX optimizations.

- [ ] **Step 4: Verify all markdown links and text consistency**

- [ ] **Step 5: Commit**

```bash
git add docs/ARCHITECTURE.md architectureBP.MD GEMINI.MD .antigravity.md README.md
git commit -m "docs: finalize zero-cost free-tier architecture and performance documentation"
```
