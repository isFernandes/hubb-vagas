# Item 12.7: Vagas Múltiplas (positionsAvailable) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow jobs to support multiple vacancies (`positionsAvailable`). The job should only close and reject remaining candidates when all positions are filled.

**Architecture:** Add a `positionsAvailable` integer column to the `Job` model (defaulting to 1). Modify `JobClosureWorker` to check the count of already approved applications for the job. If the number of approved applications (including the newly approved one) reaches `positionsAvailable`, the job status changes to `CLOSED_HIRED` and remaining applications are rejected. Otherwise, the job remains `PUBLISHED` and remaining applications stay active.

**Tech Stack:** NestJS, Prisma, RabbitMQ, Vitest, React

## Global Constraints

- Backend must use Prisma for database updates.
- If multiple positions are available, reject events are only sent to other candidates when the *last* position is filled and the job is closed.
- Keep tests passing and use TDD principles.

---

## Technical Questions & Doubts

1. **Can `positionsAvailable` be updated after the job is published?**
   - *Recommendation:* Yes, but only to a number equal to or greater than the number of already hired candidates. We will implement validation in the UPDATE route to enforce this.
2. **Should the frontend display how many positions are left?**
   - *Recommendation:* Yes, the job detail page should show "X vagas restantes" based on `positionsAvailable - approvedApplicationsCount`.
3. **If a hired candidate is removed/refunded, does a position reopen?**
   - *Recommendation:* Yes, if an approval is cancelled, the job status should return to `PUBLISHED` if it was closed, and a slot opens.

---

### Task 1: Database Migration

**Files:**
- Modify: `apps/api/src/infra/prisma/schema.prisma`

**Interfaces:**
- Consumes: Prisma schema.
- Produces: `positionsAvailable` column on `Job` model.

- [ ] **Step 1: Write schema changes**

Update `Job` model in `schema.prisma`:
```prisma
model Job {
  id                 String             @id @default(uuid())
  title              String
  description        String
  requirements       String
  companyId          String
  company            Company            @relation(fields: [companyId], references: [id])
  location           String
  contractType       String
  expiresAt          DateTime
  paymentAmountCents Int                @default(0)
  positionsAvailable Int                @default(1) // <-- Added field
  status             JobStatus          @default(DRAFT)
  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt
  applications       Application[]
  statusHistory      JobStatusHistory[]
  reports            Report[]

  @@map("jobs")
}
```

- [ ] **Step 2: Generate Prisma Client**

Run: `npx prisma generate` in `apps/api`
Expected: Client generated.

- [ ] **Step 3: Apply migrations**

Run: `npx prisma migrate dev --name add_positions_available`
Expected: Database migration runs and finishes successfully.

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/infra/prisma/schema.prisma
git commit -m "db: add positionsAvailable to Job model"
```

---

### Task 2: DTO and Service Validation

**Files:**
- Modify: `apps/api/src/jobs/dto/create-job.dto.ts` (if exists, or validation layers)
- Modify: `apps/api/src/jobs/jobs.service.ts`

**Interfaces:**
- Consumes: Job payload from HTTP controller.
- Produces: Validated `positionsAvailable` in Job creation and updates.

- [ ] **Step 1: Write failing unit test**

Modify `apps/api/src/jobs/jobs.service.spec.ts` to add validation tests:
```typescript
it('should throw BadRequestException on update if positionsAvailable is less than approved applications', async () => {
  repository.findById.mockResolvedValue({
    ...mockJob,
    positionsAvailable: 3,
  });
  vi.spyOn(prisma.application, 'count').mockResolvedValue(2);

  await expect(
    service.update('job-1', { positionsAvailable: 1 }, 'company-1', 'account-1')
  ).rejects.toThrow(BadRequestException);
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npx vitest run apps/api/src/jobs/jobs.service.spec.ts`
Expected: Test fails because of missing validation.

- [ ] **Step 3: Implement validation in jobs.service.ts**

Update `update` method in `apps/api/src/jobs/jobs.service.ts` to query database for approved application counts if `positionsAvailable` is provided. If `positionsAvailable < approvedCount`, throw `BadRequestException('Não é possível reduzir o número de vagas abaixo do total de contratações existentes.')`.

- [ ] **Step 4: Run test to verify passes**

Run: `npx vitest run apps/api/src/jobs/jobs.service.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/jobs/jobs.service.ts apps/api/src/jobs/jobs.service.spec.ts
git commit -m "feat: add positionsAvailable validation in JobsService"
```

---

### Task 3: Job Closure Worker Refactor

**Files:**
- Modify: `apps/api/src/jobs/job-closure.worker.ts`
- Create/Modify: `apps/api/src/jobs/job-closure.worker.spec.ts`

**Interfaces:**
- Consumes: `application_approved` RabbitMQ event payload.
- Produces: Atomically evaluates if job should close or remain open.

- [ ] **Step 1: Write test for multi-position closing**

Modify/Create `apps/api/src/jobs/job-closure.worker.spec.ts`:
```typescript
it('should keep job PUBLISHED if positionsAvailable is 2 and only 1 is approved', async () => {
  const worker = new JobClosureWorker(lockService, jobsRepository, statusHistoryRepository, prisma, rmqClient, redis);
  
  // mock jobsRepository.findById to return positionsAvailable: 2, status: JobStatus.PUBLISHED
  // mock prisma.application.count to return 0 (meaning this approval makes it 1)
  
  await worker.handleApplicationApproved({ jobId: 'job-1', appId: 'app-1', companyId: 'company-1' });
  
  expect(jobsRepository.update).not.toHaveBeenCalledWith('job-1', { status: JobStatus.CLOSED_HIRED });
  // should approve this application
  expect(prisma.application.update).toHaveBeenCalledWith({
    where: { id: 'app-1' },
    data: { status: 'APPROVED' }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run apps/api/src/jobs/job-closure.worker.spec.ts`
Expected: FAIL.

- [ ] **Step 3: Modify job-closure.worker.ts logic**

Replace lines in `JobClosureWorker.handleApplicationApproved` to read:
```typescript
const approvedCount = await this.prisma.application.count({
  where: { jobId, status: 'APPROVED' },
});

const isFullyStaffed = approvedCount + 1 >= job.positionsAvailable;

if (isFullyStaffed) {
  // Update Job Status to CLOSED_HIRED
  await this.jobsRepository.update(jobId, { status: JobStatus.CLOSED_HIRED });
  
  // Approve the current application and reject all remaining applications
  await this.prisma.application.update({
    where: { id: appId },
    data: { status: 'APPROVED' },
  });
  await this.prisma.application.updateMany({
    where: { jobId, id: { not: appId }, status: { in: ['APPLIED', 'SCREENING'] } },
    data: { status: 'REJECTED' },
  });
  
  // Trigger reject notifications and job_closed event...
} else {
  // Just approve this one, job remains PUBLISHED
  await this.prisma.application.update({
    where: { id: appId },
    data: { status: 'APPROVED' },
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run apps/api/src/jobs/job-closure.worker.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/jobs/job-closure.worker.ts
git commit -m "feat: refactor JobClosureWorker for multiple positions"
```

---

### Task 4: Frontend Integration

**Files:**
- Modify: `apps/web/src/pages/company/CreateJob.tsx`
- Modify: `apps/web/src/pages/candidate/JobDetails.tsx`

**Interfaces:**
- Consumes: Updated Job payloads with `positionsAvailable`.
- Produces: Form fields and detailed remaining position badges.

- [ ] **Step 1: Add input field to job creation**

Update the job creation schema and component to include a `positionsAvailable` number field (minimum 1, default 1).

- [ ] **Step 2: Add remaining positions badge in details**

Display `Vagas disponíveis: {job.positionsAvailable - approvedCount}` inside candidate and company detailed job views.

- [ ] **Step 3: Commit**

```bash
git commit -am "feat: integrate positionsAvailable in frontend"
```
