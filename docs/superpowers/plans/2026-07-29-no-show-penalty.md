# Item 12.9: Política de Cancelamento (No-Show) com Punição Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a penalty system for candidates who do not show up to hired gigs, reducing their average rating.

**Architecture:**
1. A company reports a candidate for not showing up by submitting a report of type `NO_SHOW` linked to the job and candidate's account via `POST /reports`.
2. When the admin resolves this report as approved (`RESOLVED`), the system automatically creates or overwrites a `Review` on the corresponding `Application` with direction `COMPANY_TO_USER`, rating `1`, and comment `"Penalidade automática por ausência (No-Show)"`.
3. An asynchronous event recalculates the candidate's average rating and review count, applying the penalty to their profile.

**Tech Stack:** NestJS, Prisma, RabbitMQ, Vitest, React

## Global Constraints

- Punição must only be applied when an admin resolves the report as valid.
- The rating penalty must be represented as a 1-star review in the database to keep the rating averages structurally consistent.

---

## Technical Questions & Doubts

1. **What if the company already left a review before reporting the no-show?**
   - *Recommendation:* The auto-generated penalty review will overwrite any existing review by the company for that application, setting it to 1 star.
2. **Should candidates be suspended if they collect too many no-shows?**
   - *Recommendation:* If a candidate receives 3 or more approved `NO_SHOW` reports, we should automatically update their account status to `SUSPENDED` and log it in the admin audit trail. This adds high business value and uses the existing `AccountStatus.SUSPENDED` and `AccountAuditLog` models.

---

### Task 1: No-Show Report Handler

**Files:**
- Modify: `apps/api/src/reports/reports.service.ts` (or similar controller/service layer)
- Create/Modify: `apps/api/src/reports/reports.service.spec.ts`

**Interfaces:**
- Consumes: `POST /reports` payload containing `reportedAccountId`, `reportedJobId`, and `type: 'NO_SHOW'`.
- Produces: `Report` object.

- [ ] **Step 1: Write test for creating No-Show report**

Add test to verify companies can report candidates for no-show only if the job is closed and the candidate was approved.
```typescript
it('should throw BadRequestException if candidate was not approved for the job', async () => {
  // Mock finding application for candidate and job showing status is not APPROVED
  // Expect reportsService.create(...) to throw BadRequestException
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npx vitest run apps/api/src/reports/reports.service.spec.ts`
Expected: FAIL.

- [ ] **Step 3: Implement validation in reports.service.ts**

When creating a report of type `NO_SHOW`:
- Find the application for `reportedAccountId` and `reportedJobId`.
- If no application exists or status is not `APPROVED`, throw `BadRequestException('Este candidato não foi contratado para esta vaga.')`.

- [ ] **Step 4: Run test to verify passes**

Run: `npx vitest run apps/api/src/reports/reports.service.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/reports/
git commit -m "feat: add validation for creating NO_SHOW reports"
```

---

### Task 2: Admin Resolution & Auto-Review Penalty

**Files:**
- Modify: `apps/api/src/admin/admin.service.ts` or `apps/api/src/reports/reports.service.ts` (resolution route)
- Modify: `apps/api/src/infra/prisma/prisma-repository/prismaReviews.repository.ts` (if exists, or reviews service)

**Interfaces:**
- Consumes: `POST /admin/reports/:id/resolve` (admin approves the report).
- Produces: Updated report status and creates a 1-star review.

- [ ] **Step 1: Write failing unit test**

```typescript
it('should create 1-star penalty review for user application when NO_SHOW report is resolved', async () => {
  // Mock resolving report of type NO_SHOW
  // Expect prisma.review.upsert to be called with rating: 1, direction: COMPANY_TO_USER
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npx vitest run apps/api/src/admin/admin.service.spec.ts`
Expected: FAIL.

- [ ] **Step 3: Implement resolution penalty logic**

Inside the report resolution logic:
```typescript
if (report.type === 'NO_SHOW' && report.reportedAccountId && report.reportedJobId) {
  // 1. Find the application
  const app = await this.prisma.application.findFirst({
    where: { jobId: report.reportedJobId, userId: report.reportedAccountId },
  });

  if (app) {
    // 2. Upsert a 1-star review
    await this.prisma.review.upsert({
      where: {
        applicationId_direction: {
          applicationId: app.id,
          direction: 'COMPANY_TO_USER',
        },
      },
      update: { rating: 1, comment: 'Penalidade automática por ausência (No-Show)' },
      create: {
        applicationId: app.id,
        direction: 'COMPANY_TO_USER',
        rating: 1,
        comment: 'Penalidade automática por ausência (No-Show)',
      },
    });

    // 3. Emit review updated event to trigger rating recalculation
    this.client.emit('review_created', { applicationId: app.id, direction: 'COMPANY_TO_USER' });
    
    // 4. Check for automatic suspension
    const activeNoShows = await this.prisma.report.count({
      where: {
        reportedAccountId: report.reportedAccountId,
        type: 'NO_SHOW',
        status: 'RESOLVED',
      },
    });
    
    if (activeNoShows >= 3) {
      await this.prisma.account.update({
        where: { id: report.reportedAccountId },
        data: { status: 'SUSPENDED' },
      });
      // Log audit
      await this.prisma.accountAuditLog.create({
        data: {
          accountId: report.reportedAccountId,
          adminId: adminAccountId,
          previousStatus: 'ACTIVE',
          newStatus: 'SUSPENDED',
          reason: 'Suspensão automática: 3 ou mais denúncias de No-Show confirmadas.',
        },
      });
    }
  }
}
```

- [ ] **Step 4: Run test to verify passes**

Run: `npx vitest run apps/api/src/admin/admin.service.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/admin/
git commit -m "feat: implement no-show penalty and automatic suspension on report resolution"
```

---

### Task 3: Frontend Administration & Reporting Buttons

**Files:**
- Modify: `apps/web/src/pages/company/JobDetails.tsx`
- Modify: `apps/web/src/pages/admin/Reports.tsx`

**Interfaces:**
- Consumes: Report list and details schema.
- Produces: Report modal, resolving triggers on frontend.

- [ ] **Step 1: Add "Reportar Ausência" button**

In company's Job Details view, next to approved candidates, display a "Reportar Faltoso (No-Show)" button. Clicking this opens a modal submitting a report.

- [ ] **Step 2: Add resolution controls for Admin**

In the Admin Moderation Dashboard, allow admins to click "Aprovar e Puniar No-Show" for reports of type `NO_SHOW`.

- [ ] **Step 3: Commit**

```bash
git commit -am "feat: add no-show report button and admin resolution options in frontend"
```
