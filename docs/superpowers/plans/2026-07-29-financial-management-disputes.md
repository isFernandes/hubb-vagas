# Item 13.5: Gestão Financeira e Disputas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provide accounting visibility to administrators, track financial transactions, manage platform fees, and allow resolving payment disputes when a company contests a gig.

**Architecture:**
1. Create a `Transaction` model in Prisma with status: `PENDING`, `APPROVED`, `REFUNDED`, `DISPUTED`.
2. When the Mercado Pago webhook receives an approved payment, create a `Transaction` entry. Calculate the platform fee (`feeCents`) based on the percentage stored in `GlobalConfig`.
3. Provide an Admin dashboard view showing total volume transacted (GMV), platform fee revenue, and a list of transactions.
4. Implement a dispute trigger: companies can open a dispute on finished jobs, changing the transaction status to `DISPUTED` and creating an administrative moderation ticket.
5. Admins can resolve the dispute, triggering webhook refund actions or releasing the funds (updating the status to `REFUNDED` or `APPROVED`).

**Tech Stack:** NestJS, Prisma, Mercado Pago SDK (Mocked/Real), Vitest, React

## Global Constraints

- Platform fees must be calculated using the `GlobalConfig.platformFeePercentage` database configuration (defaulting to 10.0%).
- All amounts must be stored in cents (`Int`) to prevent floating-point rounding errors.

---

## Technical Questions & Doubts

1. **How is the money split between candidate and platform?**
   - *Recommendation:* To maintain ease of deployment, the platform collects the checkout payment in full. Payouts to candidates are done manually or via batch transfers after the admin marks the transaction as released (settled). The transaction tracker serves as the ledger.
2. **When can a company open a dispute?**
   - *Recommendation:* A company can open a dispute within 24 hours of job completion (when status is `CLOSED_HIRED` and candidate is marked as approved). This freezes candidate payout in the ledger.

---

### Task 1: Database Migration for Transactions

**Files:**
- Modify: `apps/api/src/infra/prisma/schema.prisma`

**Interfaces:**
- Consumes: Prisma schema.
- Produces: `Transaction` model and relations.

- [ ] **Step 1: Write schema changes**

Update `schema.prisma`:
```prisma
enum TransactionStatus {
  PENDING
  APPROVED
  REFUNDED
  DISPUTED
}

model Transaction {
  id              String            @id @default(uuid())
  jobId           String
  job             Job               @relation(fields: [jobId], references: [id])
  applicationId   String
  application     Application       @relation(fields: [applicationId], references: [id])
  amountCents     Int
  feeCents        Int
  status          TransactionStatus @default(PENDING)
  paymentId       String?           @unique
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  @@map("transactions")
}
```
Add relations:
- `transactions Transaction[]` in `Job` model
- `transactions Transaction[]` in `Application` model

- [ ] **Step 2: Generate & Migrate**

Run: `npx prisma generate`
Run: `npx prisma migrate dev --name add_financial_transactions`
Expected: Database updated with the transactions table.

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/infra/prisma/schema.prisma
git commit -m "db: add Transaction model and status enum"
```

---

### Task 2: Transaction Ledger Logging on Webhook Approval

**Files:**
- Modify: `apps/api/src/payments/payments.controller.ts`
- Create/Modify: `apps/api/src/payments/payments.controller.spec.ts`

**Interfaces:**
- Consumes: Webhook notification payload.
- Produces: Emitted event and creates a `Transaction` row.

- [ ] **Step 1: Write failing unit test**

Modify `payments.controller.spec.ts`:
```typescript
it('should create a Transaction entry with correct fee calculations upon webhook approval', async () => {
  // Mock verifyPayment to return job-1 and app-1
  // Call controller.handleWebhook(...)
  // Expect prisma.transaction.create to be called with calculated feeCents
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npx vitest run apps/api/src/payments/payments.controller.spec.ts`
Expected: FAIL.

- [ ] **Step 3: Update payments.controller.ts**

Modify `handleWebhook` method to fetch `GlobalConfig`, calculate the fee, and log the transaction:
```typescript
const config = await this.prisma.globalConfig.findFirst();
const feePct = config ? config.platformFeePercentage : 10.0;
const totalAmountCents = job.paymentAmountCents;
const feeCents = Math.round((totalAmountCents * feePct) / 100);

await this.prisma.transaction.create({
  data: {
    jobId,
    applicationId: appId,
    amountCents: totalAmountCents,
    feeCents,
    status: 'APPROVED',
    paymentId: body.data.id.toString(),
  },
});
```

- [ ] **Step 4: Run test to verify passes**

Run: `npx vitest run apps/api/src/payments/payments.controller.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/payments/
git commit -m "feat: log transaction in ledger when payment is approved"
```

---

### Task 3: Disputes API and Admin Resolution Endpoint

**Files:**
- Create: `apps/api/src/payments/disputes.controller.ts`
- Create: `apps/api/src/payments/disputes.service.ts`

**Interfaces:**
- Consumes: `POST /disputes` (Company raises dispute) / `POST /admin/disputes/:id/resolve` (Admin resolution).
- Produces: Updates transaction status.

- [ ] **Step 1: Write controller and service logic**

Implement dispute controller:
- `POST /disputes` accepts `transactionId` and `reason`. Sets status to `DISPUTED`.
- `POST /admin/disputes/:id/resolve` accepts `action` ('REFUND' or 'RELEASE').
  - If 'REFUND': call Mercado Pago refund API (mocked) and update status to `REFUNDED`.
  - If 'RELEASE': update status to `APPROVED` (settles ledger).

- [ ] **Step 2: Commit**

```bash
git add apps/api/src/payments/disputes.controller.ts apps/api/src/payments/disputes.service.ts
git commit -m "feat: implement disputes controller and administrative resolution endpoints"
```

---

### Task 4: Admin Financial Dashboard & Dispute Moderator UI

**Files:**
- Modify: `apps/web/src/pages/admin/Dashboard.tsx`
- Create: `apps/web/src/pages/admin/Disputes.tsx`

**Interfaces:**
- Consumes: Transaction statistics and lists endpoints.
- Produces: Revenue charts, dispute resolution action buttons.

- [ ] **Step 1: Build metrics panel**

Add cards for "Total Transacionado (GMV)" and "Taxas Retidas (Receita)" using React chart dashboards.

- [ ] **Step 2: Create Dispute Moderator view**

Build a list page for admins to review and resolve open disputes.

- [ ] **Step 3: Commit**

```bash
git commit -am "feat: implement financial analytics and dispute moderator views in admin dashboard"
```
