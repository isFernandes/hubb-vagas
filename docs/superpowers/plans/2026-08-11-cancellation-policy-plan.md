# Cancellation Policy & No-Show Punishment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a cancellation policy that penalizes users who cancel gigs less than 24 hours in advance, while promoting standby candidates to replace them.

**Architecture:** Add a new `CANCELLED` status to Prisma schema, create a `PATCH /applications/:id/cancel` endpoint in the API that applies a star deduction based on the time remaining to `executionDate`, triggers `StandbyPromotionService` for `APPROVED` cancellations, and add the UI cancellation flow to the candidate's dashboard with appropriate warnings.

**Tech Stack:** NestJS, Prisma, React, React Query, Tailwind CSS.

## Global Constraints

- Backend uses standard ES6 `import`, no `require()`.
- Use Github style for markdown and file paths.

---

### Task 1: Database Schema

**Files:**
- Modify: `apps/api/src/infra/prisma/schema.prisma`

**Interfaces:**
- Produces: Updated Prisma Client with `CANCELLED` in `ApplicationStatus` enum.

- [ ] **Step 1: Update schema.prisma**

Modify `apps/api/src/infra/prisma/schema.prisma` to add `CANCELLED` to the `ApplicationStatus` enum.

- [ ] **Step 2: Generate and Push Prisma changes**

Run: `npx prisma db push --schema=apps/api/src/infra/prisma/schema.prisma` and `npx prisma generate --schema=apps/api/src/infra/prisma/schema.prisma`
Expected: Database updated and client regenerated successfully.

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/infra/prisma/schema.prisma
git commit -m "feat(db): add CANCELLED to ApplicationStatus enum"
```

### Task 2: Backend Logic - Cancellation Endpoint

**Files:**
- Modify: `apps/api/src/applications/applications.controller.ts`
- Modify: `apps/api/src/applications/applications.service.ts`

**Interfaces:**
- Consumes: Prisma client with `CANCELLED` status.
- Produces: `PATCH /applications/:id/cancel` endpoint.

- [ ] **Step 1: Add method to applications.service.ts**

Implement `cancelApplication(applicationId: string, userId: string)` in `ApplicationsService`.
Logic:
- Find application by ID, verify `userId` matches. If not found or mismatch, throw `NotFoundException`/`ForbiddenException`.
- If application status is already `CANCELLED` or `REJECTED`, throw `BadRequestException`.
- If `status === 'APPROVED'` and `job.executionDate` exists:
  - Calculate hours diff: `(job.executionDate.getTime() - Date.now()) / (1000 * 60 * 60)`
  - If `< 5`, penalty is `1.5`.
  - If `>= 5` and `< 24`, penalty is `1.0`.
  - Otherwise, penalty is `0`.
  - If penalty > 0, update user's `averageRating = Math.max(0, user.averageRating - penalty)`.
- Update application status to `CANCELLED`.
- If original status was `APPROVED`, call `StandbyPromotionService.promoteNextStandby(jobId)` (requires injecting it into the service). Wait, check if `StandbyPromotionService` is available in `ApplicationsModule`.
- Emit `application_cancelled` via RabbitMQ.

- [ ] **Step 2: Add endpoint to applications.controller.ts**

Add `@Patch(':id/cancel')` endpoint protected by `JwtAuthGuard` and `RolesGuard`.
Extract `req.user.profileId` (or `req.user.id` based on auth strategy) and call `applicationsService.cancelApplication(id, userId)`.

- [ ] **Step 3: Build backend**

Run: `cd apps/api && npm run build`
Expected: Success.

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/applications/applications.controller.ts apps/api/src/applications/applications.service.ts
git commit -m "feat(api): implement application cancellation logic and endpoint"
```

### Task 3: Frontend UI - Cancel Button and Modal

**Files:**
- Modify: `apps/web/src/pages/candidate/MyApplications.tsx`

**Interfaces:**
- Consumes: API `PATCH /applications/:id/cancel`.
- Produces: Actionable UI in Candidate Dashboard.

- [ ] **Step 1: Implement Cancellation Mutation**

In `MyApplications.tsx`, add a `useMutation` for `api.patch('/applications/${id}/cancel')`.
On success, invalidate the `['candidate-applications']` query and show a success toast.

- [ ] **Step 2: Add UI Elements**

For applications with status `APPLIED`, `SCREENING`, `STANDBY`, or `APPROVED`, add a "Cancelar Candidatura" button (red variant).
When clicked, show a native `window.confirm` or a custom Dialog/Modal.
If `status === 'APPROVED'`:
  - Calculate time to `job.executionDate` in frontend.
  - If `< 24h`, show a prominent warning text inside the confirm dialog: *"Atenção: Como falta menos de 24h para o início deste bico, este cancelamento afetará negativamente sua reputação na plataforma."*
- If confirmed, execute the mutation.

- [ ] **Step 3: Build frontend**

Run: `cd apps/web && npm run build`
Expected: Success.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/pages/candidate/MyApplications.tsx
git commit -m "feat(web): add cancellation UI and no-show warning"
```
