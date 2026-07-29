# Item 12.10: Validador de Conflito de Agenda Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent candidates from applying to or being approved for jobs whose execution times overlap or have less than 1 hour of separation.

**Architecture:**
1. Add `executionDate: DateTime?` and `durationHours: Int?` to the `Job` model in Prisma.
2. Update the job posting endpoint to receive and validate these new fields.
3. Update the `apply` method in `ApplicationsService` to query active applications (status `APPLIED`, `SCREENING`, or `APPROVED`) and check for execution time overlaps including a 1-hour buffer.
4. Add a similar check at approval time (in `JobClosureWorker` or `approveApplication` route) to prevent double hiring if another application got approved in the meantime.

**Tech Stack:** NestJS, Prisma, Vitest, React

## Global Constraints

- Backend must use Prisma for queries.
- Conflict definition: `(startB < endA + 1 hour) AND (startA < endB + 1 hour)`.
- Non-execution date jobs (legacy jobs where `executionDate` is null) are ignored in conflict validation.

---

## Technical Questions & Doubts

1. **Should conflict check block `APPLIED` status or only `APPROVED`?**
   - *Recommendation:* If we block applying, a candidate cannot apply to multiple potential jobs that overlap. A better UX is: allow applying to multiple overlapping jobs, but when one is **APPROVED**, automatically change the status of other overlapping applications to **REJECTED** or **CANCELLED** and block new applications for that slot. However, for this task, we will implement validation at two levels:
     - On applying: throw warning/error if they are already **APPROVED** for an overlapping job.
     - On approval (checkout/payment): throw error if the candidate is already **APPROVED** for an overlapping job, and cancel pending applications for overlapping slots upon successful payment.
2. **Are timezone offsets managed on the backend?**
   - *Recommendation:* Dates should be stored in UTC in the database, and timezone conversions should be handled on the frontend.

---

### Task 1: Database Migration for Execution Date

**Files:**
- Modify: `apps/api/src/infra/prisma/schema.prisma`

**Interfaces:**
- Consumes: Prisma schema.
- Produces: `executionDate` (DateTime) and `durationHours` (Int) columns on `Job` model.

- [ ] **Step 1: Write schema changes**

Update `Job` model in `schema.prisma`:
```prisma
model Job {
  id                 String             @id @default(uuid())
  // ... existing fields ...
  executionDate      DateTime?          // <-- New field
  durationHours      Int?               // <-- New field
  // ... remaining fields ...
}
```

- [ ] **Step 2: Generate Client & Migrate**

Run: `npx prisma generate` in `apps/api`
Run: `npx prisma migrate dev --name add_job_execution_fields`
Expected: Database updated with the new execution fields.

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/infra/prisma/schema.prisma
git commit -m "db: add executionDate and durationHours to Job model"
```

---

### Task 2: Service Validation Logic

**Files:**
- Modify: `apps/api/src/applications/applications.service.ts`
- Create/Modify: `apps/api/src/applications/applications.service.spec.ts`

**Interfaces:**
- Consumes: `jobId`, `userId` inside `ApplicationsService.apply`.
- Produces: `Application` or throws `BadRequestException` on conflict.

- [ ] **Step 1: Write failing unit test**

Add to `applications.service.spec.ts`:
```typescript
it('should throw BadRequestException if candidate is already approved for a job overlapping the new job', async () => {
  const newJob = { id: 'job-new', executionDate: new Date('2026-08-01T10:00:00Z'), durationHours: 2 };
  const existingJob = { id: 'job-existing', executionDate: new Date('2026-08-01T11:30:00Z'), durationHours: 2 };
  
  // Mock applicationsRepo to return an APPROVED application for job-existing
  // Call service.apply('job-new', 'user-1')
  // Expect to throw BadRequestException
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npx vitest run apps/api/src/applications/applications.service.spec.ts`
Expected: FAIL.

- [ ] **Step 3: Implement validation in applications.service.ts**

Find or create the validation logic:
```typescript
const targetJob = await this.prisma.job.findUnique({ where: { id: jobId } });
if (targetJob?.executionDate && targetJob?.durationHours) {
  const targetStart = targetJob.executionDate.getTime();
  const targetEnd = targetStart + targetJob.durationHours * 60 * 60 * 1000;

  const overlappingApps = await this.prisma.application.findMany({
    where: {
      userId,
      status: 'APPROVED',
      job: {
        executionDate: { not: null },
        durationHours: { not: null },
      },
    },
    include: { job: true },
  });

  for (const app of overlappingApps) {
    const appStart = app.job.executionDate.getTime();
    const appEnd = appStart + app.job.durationHours * 60 * 60 * 1000;

    // Buffer of 1 hour (3600000 ms)
    const startConflict = targetStart < appEnd + 3600000;
    const endConflict = appStart < targetEnd + 3600000;

    if (startConflict && endConflict) {
      throw new BadRequestException('Conflito de agenda: você já possui um bico aprovado neste horário (respeitando o intervalo mínimo de 1 hora).');
    }
  }
}
```

- [ ] **Step 4: Run test to verify passes**

Run: `npx vitest run apps/api/src/applications/applications.service.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/applications/applications.service.ts
git commit -m "feat: implement agenda conflict checker in applications service"
```

---

### Task 3: Handle Automatic Rejection of Overlapping Pending Gigs

**Files:**
- Modify: `apps/api/src/jobs/job-closure.worker.ts`

**Interfaces:**
- Consumes: Approving application event.
- Produces: Marks other pending overlapping applications of this candidate as REJECTED.

- [ ] **Step 1: Write validation step in worker**

When an application is approved:
1. Fetch candidate's other applications that are `APPLIED` or `SCREENING`.
2. Check if they overlap with the newly approved job's duration.
3. If they overlap, automatically set their status to `REJECTED` (with reason "Conflito de agenda").

- [ ] **Step 2: Commit**

```bash
git add apps/api/src/jobs/job-closure.worker.ts
git commit -m "feat: cancel pending overlapping applications on approval"
```

---

### Task 4: Frontend Fields and Warnings

**Files:**
- Modify: `apps/web/src/pages/company/CreateJob.tsx`
- Modify: `apps/web/src/pages/candidate/JobDetails.tsx`

**Interfaces:**
- Consumes: Job details page schema.
- Produces: Execution date and duration fields / warnings in frontend.

- [ ] **Step 1: Add inputs to job creation form**

Add date/time input for `executionDate` and a number select for `durationHours` in the job creation page.

- [ ] **Step 2: Display execution info on Job Card/Details**

Render the execution date nicely (e.g., "📅 01/08/2026 às 10:00 - Duração: 2h") and display a warning if the candidate is already scheduled for another gig at that time.

- [ ] **Step 3: Commit**

```bash
git commit -am "feat: add execution date input and details on frontend"
```
