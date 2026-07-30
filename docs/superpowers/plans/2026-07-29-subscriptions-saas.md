# Improvement 5.1: Planos de Assinatura (SaaS) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Offer paid monthly subscriptions (Premium) to companies using Mercado Pago Subscriptions API, limiting the number of simultaneously active jobs to 2 for Free tier companies.

**Architecture:**
1. Database: Add `PlanType` (enum FREE, PREMIUM) and `subscriptionActiveUntil` DateTime to `Company` model.
2. Webhook: Listen to Mercado Pago subscription updates to update company subscription status.
3. Limit Check: Add validation logic in `JobsService` to reject publishing jobs if active jobs count >= 2 for FREE tier. Advanced features like quizzes and matching engine remain 100% unlocked.

**Tech Stack:** NestJS, Prisma, Mercado Pago SDK, React

---

### Task 1: Subscription Database Schema

**Files:**
- Modify: `apps/api/src/infra/prisma/schema.prisma`

**Interfaces:**
- Consumes: Prisma Company schema.
- Produces: `plan` columns and active limit schema.

- [ ] **Step 1: Write schema changes**

```prisma
enum PlanType {
  FREE
  PREMIUM
}

model Company {
  // ...
  plan           PlanType  @default(FREE)
  activeUntil    DateTime?
  // ...
}
```

- [ ] **Step 2: Generate client and migrate**

Run: `npx prisma generate`
Run: `npx prisma migrate dev --name add_saas_plan_fields`

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/infra/prisma/schema.prisma
git commit -m "db: add saas plan schema columns"
```

---

### Task 2: Active Vagas Limit & Webhook Handler

**Files:**
- Modify: `apps/api/src/jobs/jobs.service.ts`
- Create: `apps/api/src/payments/subscriptions.service.ts`
- Modify: `apps/api/src/payments/payments.controller.ts`

**Interfaces:**
- Consumes: Mercado Pago subscription webhook payload.
- Produces: Updates company plan status in database.

- [ ] **Step 1: Limit active jobs**

In `JobsService.create` or `publish`, count active jobs. Reject if count >= 2 and plan is FREE.

- [ ] **Step 2: Handle subscriptions updates**

Verify subscription events from Mercado Pago. Update the database record of the target `Company` matching the customer email/ID with their plan tier and set expiration `activeUntil` (e.g. current date + 30 days).

- [ ] **Step 3: Commit**

```bash
git commit -am "feat: implement active jobs limit check and webhook handler"
```

---

### Task 3: Subscription Panel and Create Job warnings

**Files:**
- Modify: `apps/web/src/pages/company/Settings.tsx`
- Modify: `apps/web/src/pages/company/NewJob.tsx`

**Interfaces:**
- Consumes: Profile billing info.
- Produces: Upgrade checkout alerts.

- [ ] **Step 1: Interface warnings**

Disable publication buttons in `NewJob` if company is on FREE tier with 2 active jobs. Add checkout triggers in `Settings` page.

- [ ] **Step 2: Commit**

```bash
git commit -am "feat: integrate billing upgrade options and warnings in frontend"
```
