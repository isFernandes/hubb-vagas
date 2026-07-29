# Item 14.1: Fila de Espera / Reservas (Standby) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow candidates to be placed on a standby list ("fila de espera") if the company enables this feature for their job. If a hired candidate cancels or gets reported for a no-show, the system automatically promotes the first standby candidate.

**Architecture:**
1. Add `STANDBY` to the `ApplicationStatus` enum in Prisma.
2. Add `enableStandby Boolean @default(false)` to the `Job` model in Prisma.
3. In the company's job dashboard, allow enabling standby when creating/editing the job.
4. If a job has `enableStandby: true`, when the final position is approved (meaning the job is filled and changes to `CLOSED_HIRED`), change the status of all other pending candidates (`APPLIED`, `SCREENING`) automatically to `STANDBY` instead of rejecting them.
5. Create a standby promotion event handler. When a hired candidate's application is cancelled (due to refunds, admin no-show approvals, or manual cancellation), check if there are `STANDBY` applications for that job.
6. If standby applications exist, promote the oldest standby candidate (`createdAt ASC`) to `APPROVED`.
7. If no standby candidates exist, reopen the job by changing its status back to `PUBLISHED` and freeing the slot.

**Tech Stack:** NestJS, Prisma, RabbitMQ, Vitest, React

## Global Constraints

- Standby promotions must be processed sequentially based on application submission date (`createdAt ASC`).
- Promoted standby candidates inherit the approved status immediately.
- Reopening the job back to `PUBLISHED` is required if no standby candidates are available.

---

### Task 1: Database Updates (Status and Job config)

**Files:**
- Modify: `apps/api/src/infra/prisma/schema.prisma`

**Interfaces:**
- Consumes: Prisma schema.
- Produces: Updated `ApplicationStatus` enum and `enableStandby` on `Job` model.

- [ ] **Step 1: Write schema changes**

Update `schema.prisma`:
```prisma
enum ApplicationStatus {
  APPLIED
  SCREENING
  APPROVED
  REJECTED
  STANDBY // <-- Added value
}

model Job {
  id                 String             @id @default(uuid())
  // ... existing fields ...
  enableStandby      Boolean            @default(false) // <-- New field
  // ... remaining fields ...
}
```

- [ ] **Step 2: Generate & Migrate**

Run: `npx prisma generate`
Run: `npx prisma migrate dev --name add_standby_features`
Expected: Database updated with the new columns.

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/infra/prisma/schema.prisma
git commit -m "db: add enableStandby and STANDBY application status"
```

---

### Task 2: Service Logic for Standby Promotion & Job Reopening

**Files:**
- Create: `apps/api/src/applications/standby-promotion.service.ts`
- Create: `apps/api/src/applications/standby-promotion.service.spec.ts`
- Modify: `apps/api/src/applications/applications.module.ts`

**Interfaces:**
- Consumes: `promoteNextStandby(jobId: string): Promise<void>`
- Produces: Updates the first standby candidate to `APPROVED` or reopens the job to `PUBLISHED`.

- [ ] **Step 1: Write unit tests**

Create `apps/api/src/applications/standby-promotion.service.spec.ts` to test:
- Promotion of oldest standby candidate to `APPROVED`.
- Reopening of Job to `PUBLISHED` if standby is empty.

- [ ] **Step 2: Run test to verify failure**

Run: `npx vitest run apps/api/src/applications/standby-promotion.service.spec.ts`
Expected: FAIL.

- [ ] **Step 3: Implement StandbyPromotionService**

Create `apps/api/src/applications/standby-promotion.service.ts`:
```typescript
import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../infra/prisma/prisma.service';
import { ClientProxy } from '@nestjs/microservices';
import { JobStatus } from '../infra/prisma/generated/client';

@Injectable()
export class StandbyPromotionService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('RMQ_CLIENT') private readonly client: ClientProxy,
  ) {}

  async promoteNextStandby(jobId: string) {
    const nextStandby = await this.prisma.application.findFirst({
      where: { jobId, status: 'STANDBY' },
      orderBy: { createdAt: 'asc' },
      include: { user: { include: { account: true } } },
    });

    if (nextStandby) {
      // 1. Promote to APPROVED
      await this.prisma.application.update({
        where: { id: nextStandby.id },
        data: { status: 'APPROVED' },
      });

      // 2. Notify candidate
      this.client.emit('application_promoted_from_standby', {
        email: nextStandby.user.account.email,
        jobId,
        applicationId: nextStandby.id,
      });
    } else {
      // 3. No standby candidates, reopen the job
      await this.prisma.job.update({
        where: { id: jobId },
        data: { status: JobStatus.PUBLISHED },
      });
    }
  }
}
```

- [ ] **Step 4: Run test to verify passes**

Run: `npx vitest run apps/api/src/applications/standby-promotion.service.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/applications/
git commit -m "feat: implement StandbyPromotionService and job reopening"
```

---

### Task 3: Hook Standby Conversion on Job Closure Worker

**Files:**
- Modify: `apps/api/src/jobs/job-closure.worker.ts`

**Interfaces:**
- Consumes: Approving final candidate event.
- Produces: Updates other applications to `STANDBY` (if enableStandby is true) or `REJECTED` (if false).

- [ ] **Step 1: Update JobClosureWorker logic**

Check `job.enableStandby` in `handleApplicationApproved`:
```typescript
if (isFullyStaffed) {
  await this.jobsRepository.update(jobId, { status: JobStatus.CLOSED_HIRED });
  
  await this.prisma.application.update({
    where: { id: appId },
    data: { status: 'APPROVED' },
  });

  const nextStatus = job.enableStandby ? 'STANDBY' : 'REJECTED';

  await this.prisma.application.updateMany({
    where: { jobId, id: { not: appId }, status: { in: ['APPLIED', 'SCREENING'] } },
    data: { status: nextStatus },
  });
  
  if (!job.enableStandby) {
    // emit rejection events...
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/api/src/jobs/job-closure.worker.ts
git commit -m "feat: conditionally convert pending candidates to standby in JobClosureWorker"
```

---

### Task 4: Frontend Toggle and Standby Views

**Files:**
- Modify: `apps/web/src/pages/company/NewJob.tsx`
- Modify: `apps/web/src/pages/company/JobDetails.tsx`

**Interfaces:**
- Consumes: Job details page schema.
- Produces: Standby status toggle and standby candidates sections.

- [ ] **Step 1: Add checkbox to NewJob.tsx**

Add checkbox: `"Ativar fila de espera (Standby)"` updating the `enableStandby` state in the form payload.

- [ ] **Step 2: Show standby queue list in JobDetails.tsx**

Under the candidates list, group candidates in `STANDBY` status under a new section titled "Candidatos em Fila de Espera" and display their position in line.

- [ ] **Step 3: Commit**

```bash
git commit -am "feat: implement standby form options and lists in frontend"
```
