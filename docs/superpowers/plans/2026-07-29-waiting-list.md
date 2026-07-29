# Item 14.1: Fila de Espera / Reservas (Standby) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow candidates to be placed on a standby list ("fila de espera") if the company enables this feature for their job. If a hired candidate cancels or gets reported for a no-show, the system reopens the job and moves the first standby candidate to the under-review status (`SCREENING`) so the company can manually approve and pay for them.

**Architecture:**
1. Add `STANDBY` to the `ApplicationStatus` enum in Prisma.
2. Add `enableStandby Boolean @default(false)` to the `Job` model in Prisma.
3. In the company's job dashboard, allow enabling standby when creating/editing the job.
4. If a job has `enableStandby: true`, when the final position is approved (meaning the job is filled and changes to `CLOSED_HIRED`), change the status of all other pending candidates (`APPLIED`, `SCREENING`) automatically to `STANDBY` instead of rejecting them.
5. Create a standby promotion event handler. When a hired candidate's application is cancelled (due to refunds, admin no-show approvals, or manual cancellation):
   - Set the job's status back to `PUBLISHED` (reopening the slot).
   - If standby candidates exist, promote the oldest standby candidate (`createdAt ASC`) to `SCREENING` (under review).
   - Emit an event to notify the company that a candidate has been promoted to review, directing them to the dashboard to manually approve and pay for the new candidate.

**Tech Stack:** NestJS, Prisma, RabbitMQ, Vitest, React

## Global Constraints

- Standby promotions must change candidate status to `SCREENING` (never `APPROVED` automatically).
- Reopening the job back to `PUBLISHED` is required when a slot opens up, regardless of whether a standby queue exists.
- The company must explicitly review and perform checkout/payment to hire a promoted candidate.

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
- Produces: Reopens the job to `PUBLISHED` and moves the oldest standby to `SCREENING` (if exists).

- [ ] **Step 1: Write unit tests**

Create `apps/api/src/applications/standby-promotion.service.spec.ts` to test:
- Reopening of Job to `PUBLISHED`.
- Promotion of the oldest standby candidate to `SCREENING` status.
- Notification event trigger for the company owner.

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
    // 1. Reopen the job to PUBLISHED
    await this.prisma.job.update({
      where: { id: jobId },
      data: { status: JobStatus.PUBLISHED },
    });

    // 2. Fetch the oldest standby candidate
    const nextStandby = await this.prisma.application.findFirst({
      where: { jobId, status: 'STANDBY' },
      orderBy: { createdAt: 'asc' },
      include: { job: { include: { company: { include: { account: true } } } } },
    });

    if (nextStandby) {
      // 3. Move from STANDBY to SCREENING (for manual review)
      await this.prisma.application.update({
        where: { id: nextStandby.id },
        data: { status: 'SCREENING' },
      });

      // 4. Notify the company owner via RabbitMQ
      this.client.emit('standby_candidate_promoted_to_screening', {
        companyEmail: nextStandby.job.company.account.email,
        jobId,
        jobTitle: nextStandby.job.title,
        applicationId: nextStandby.id,
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
git commit -m "feat: implement StandbyPromotionService with screening promotion"
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

Under the candidates list, group candidates in `STANDBY` status under a new section titled "Candidatos em Fila de Espera" and display their position in line. Ensure the "Aprovar" button is visible and active for candidates promoted to `SCREENING`.

- [ ] **Step 3: Commit**

```bash
git commit -am "feat: implement standby form options and lists in frontend"
```
