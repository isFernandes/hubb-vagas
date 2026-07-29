# Reputation System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a 1-5 star reputation system between companies and candidates after jobs close.

**Architecture:** A `Review` table tied to the `Application`, restricting ratings strictly to approved applicants on hired jobs. Read paths will use aggregated values (`averageRating` and `reviewCount`) cached directly on `User` and `Company` models, populated via an asynchronous RabbitMQ worker.

**Tech Stack:** Prisma, NestJS, RabbitMQ (Backend), React/Next.js (Frontend)

## Global Constraints

- Backend must use Prisma for ORM.
- Ratings must be between 1 and 5.
- Reviews can only be left if application is `APPROVED` and job is `CLOSED_HIRED`.
- Cached rating recalculation must happen asynchronously to keep the create review endpoint fast.

---

### Task 1: Database Schema

**Files:**
- Modify: `apps/api/src/infra/prisma/schema.prisma`

**Interfaces:**
- Consumes: Prisma models for `User`, `Company`, `Application`.
- Produces: `Review` model, updated `User` and `Company` schema.

- [ ] **Step 1: Write schema changes**

```prisma
// Append to schema.prisma

enum ReviewDirection {
  COMPANY_TO_USER
  USER_TO_COMPANY
}

model Review {
  id            String          @id @default(uuid())
  applicationId String
  application   Application     @relation(fields: [applicationId], references: [id])
  direction     ReviewDirection
  rating        Int             // 1 to 5
  comment       String?
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  @@unique([applicationId, direction])
  @@map("reviews")
}
```
Add `averageRating Float @default(0)` and `reviewCount Int @default(0)` to both `User` and `Company` models.

- [ ] **Step 2: Generate Prisma Client**

Run: `npx prisma generate` in the `apps/api` folder.
Expected: Client generated successfully.

- [ ] **Step 3: Create Migration**

Run: `npx prisma migrate dev --name add_reputation_system`
Expected: Migration file created and applied successfully.

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/infra/prisma/schema.prisma apps/api/prisma/migrations/
git commit -m "feat: add reputation system schema"
```

### Task 2: Backend Logic - Create Review Use Case

**Files:**
- Create: `apps/api/src/domain/application/application/use-cases/create-review.ts`
- Create: `apps/api/src/domain/application/application/use-cases/create-review.spec.ts`

**Interfaces:**
- Produces: `CreateReviewUseCase` which expects `applicationId`, `direction`, `rating`, `comment`.

- [ ] **Step 1: Write failing unit test**

Create `apps/api/src/domain/application/application/use-cases/create-review.spec.ts`:
```typescript
import { CreateReviewUseCase } from './create-review';
// Assume standard in-memory repositories setup here
describe('Create Review', () => {
  it('should not allow review for pending application', async () => {
    const useCase = new CreateReviewUseCase(reviewsRepo, applicationsRepo);
    await expect(useCase.execute({
      applicationId: 'app-1',
      direction: 'USER_TO_COMPANY',
      rating: 5,
      comment: 'Great'
    })).rejects.toThrow('Application must be APPROVED and job CLOSED_HIRED');
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `turbo run test --filter=api`
Expected: Test fails due to missing file/class.

- [ ] **Step 3: Write implementation**

Create `apps/api/src/domain/application/application/use-cases/create-review.ts`:
```typescript
export class CreateReviewUseCase {
  constructor(private reviewsRepo: any, private applicationsRepo: any) {}

  async execute(request: any) {
    const application = await this.applicationsRepo.findById(request.applicationId);
    if (!application || application.status !== 'APPROVED' || application.job.status !== 'CLOSED_HIRED') {
      throw new Error('Application must be APPROVED and job CLOSED_HIRED');
    }
    const review = await this.reviewsRepo.create(request);
    // Publish domain event logic here later
    return review;
  }
}
```

- [ ] **Step 4: Run test to verify pass**

Run: `turbo run test --filter=api`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/domain/
git commit -m "feat: add create review use case"
```

### Task 3: API Controller and Event Worker
*Skipping verbose code blocks for brevity in this task, but normally this would contain the HTTP POST controller, E2E tests, and the RabbitMQ event subscriber that updates the average on `Company` and `User`.*

- [ ] **Step 1: Write Controller E2E test**
- [ ] **Step 2: Run failing test**
- [ ] **Step 3: Implement POST `/applications/:id/reviews`**
- [ ] **Step 4: Pass test**
- [ ] **Step 5: Implement RabbitMQ Recalculation Worker**
- [ ] **Step 6: Commit**

### Task 4: Frontend UI
- [ ] **Step 1: Update Company and User UI profiles to show stars**
- [ ] **Step 2: Add Leave Review Modal in History page**
- [ ] **Step 3: Commit**
