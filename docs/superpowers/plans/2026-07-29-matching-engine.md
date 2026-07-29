# Improvement 2.1: Motor de Matching Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a composite matching algorithm that scores and ranks candidates for a job based on their operational profiles, text similarity, general rating reputation, and prior success history in the same company category.

**Architecture:**
1. Database: Add `CompanyCategory` enum and add `category` to `Company` (required) and `Job` (optional, inherits company category).
2. Logic: Create `MatchingService` computing:
   - Bio/skills text keyword similarity (Jaccard index, up to 40%).
   - Contract type and location compatibility (up to 30%).
   - User `averageRating` (up to 10%).
   - History boost: check past positive candidate reviews. If past jobs share the same `CompanyCategory`, apply +10% boost per job (capped at 20%).
3. Endpoint: GET `/jobs/:id/matching` returns candidates sorted by score.

**Tech Stack:** NestJS, Prisma, React

---

### Task 1: Database Migration for Categories

**Files:**
- Modify: `apps/api/src/infra/prisma/schema.prisma`

**Interfaces:**
- Consumes: Prisma schema.
- Produces: `CompanyCategory` enum, category fields on Job and Company models.

- [ ] **Step 1: Write schema updates**

Add to `schema.prisma`:
```prisma
enum CompanyCategory {
  RESTAURANT
  CONSTRUCTION
  EVENTS
  RETAIL
  LOGISTICS
  GENERAL_SERVICES
  OTHER
}

model Company {
  // ...
  category      CompanyCategory    @default(OTHER)
  // ...
}

model Job {
  // ...
  category      CompanyCategory?
  // ...
}
```

- [ ] **Step 2: Generate client and migrate**

Run: `npx prisma generate`
Run: `npx prisma migrate dev --name add_company_category`
Expected: Database updated with the new categories.

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/infra/prisma/schema.prisma
git commit -m "db: add CompanyCategory enum and fields to Company and Job"
```

---

### Task 2: Service Calculation Logic

**Files:**
- Create: `apps/api/src/jobs/matching.service.ts`
- Create: `apps/api/src/jobs/matching.service.spec.ts`

**Interfaces:**
- Consumes: User data, Job requirements, and completed candidate applications.
- Produces: Proximity score percentage (Float).

- [ ] **Step 1: Write calculation logic**

Implement calculations for:
- Text keyword overlap.
- Location and contract comparisons.
- Rating mapping.
- Categories query on past positive reviews for matching boost (+10% per matching category).

- [ ] **Step 2: Run unit tests**

Verify Jaccard calculations and category history boosts.

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/jobs/matching.service.ts
git commit -m "feat: implement composite matching engine service with sector history boosts"
```

---

### Task 3: API integration and Frontend Ranking

**Files:**
- Modify: `apps/api/src/jobs/jobs.controller.ts`
- Modify: `apps/web/src/pages/company/Settings.tsx`
- Modify: `apps/web/src/pages/company/JobDetails.tsx`

**Interfaces:**
- Consumes: GET `/jobs/:id/matching`
- Produces: Categorized forms and sorted candidates list.

- [ ] **Step 1: Expose endpoints**

Expose GET `/jobs/:id/matching` returning candidates list sorted by score.

- [ ] **Step 2: Update frontend forms and lists**

Add category drop-down in company settings page. Display match percentage badge and sort candidates in job details view.

- [ ] **Step 3: Commit**

```bash
git commit -am "feat: integrate company categories and matching scores in frontend"
```
