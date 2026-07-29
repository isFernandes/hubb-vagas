# Improvement 2.2: Assessments e Quizzes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow companies to create technical screening quizzes (maximum 4 questions, max 120 characters per question) for their jobs. Candidates must answer the quiz during application, and their scores are displayed to the company.

**Architecture:**
1. Database: Add models `Quiz` (linked to Job) and `Question` (multiple choice). Add `scorePercentage` (Int) and `quizAnswers` (Json) in `Application`.
2. When applying to a job with a quiz, candidates submit their answers. The service calculates their score.
3. Show scores to companies on their candidate tracking boards, without blocking applications due to low scores.

**Tech Stack:** NestJS, Prisma, React

---

### Task 1: Quiz Database Schema

**Files:**
- Modify: `apps/api/src/infra/prisma/schema.prisma`

**Interfaces:**
- Consumes: Prisma schema.
- Produces: `Quiz`, `Question`, and updated `Application` model.

- [ ] **Step 1: Write schema changes**

Update `schema.prisma` to add:
```prisma
model Quiz {
  id        String     @id @default(uuid())
  jobId     String     @unique
  job       Job        @relation(fields: [jobId], references: [id])
  questions Question[]
}

model Question {
  id             String   @id @default(uuid())
  quizId         String
  quiz           Quiz     @relation(fields: [quizId], references: [id])
  text           String
  options        String[] // Array of option strings
  correctOption  Int      // Index of correct option (0-3)
}
```
Add `scorePercentage Int?` and `quizAnswers Json?` to `Application`.

- [ ] **Step 2: Migrate**

Run: `npx prisma migrate dev --name add_quiz_assessments`
Expected: Database updated.

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/infra/prisma/schema.prisma
git commit -m "db: add Quiz and Question schemas"
```

---

### Task 2: Quiz Submissions & Score Calculation

**Files:**
- Modify: `apps/api/src/applications/applications.service.ts`
- Modify: `apps/api/src/applications/dto/apply.dto.ts` (if exists, or applications service logic)

**Interfaces:**
- Consumes: User answers inside apply request.
- Produces: `scorePercentage` and `quizAnswers` saved on the application.

- [ ] **Step 1: Write validation checks**

Enforce validation in DTO / Service:
- Max 4 questions.
- Question text max 120 characters.
- Options text max 60 characters.

- [ ] **Step 2: Calculate score on application apply**

In `ApplicationsService.apply`, check if job has a quiz. If yes:
- Verify candidate answers against correct questions option indexes.
- Calculate `scorePercentage = (correctCount / totalQuestions) * 100`.
- Save `scorePercentage` and stringified `quizAnswers` in application creation payload.

- [ ] **Step 3: Commit**

```bash
git commit -am "feat: calculate and save candidate quiz score on apply with constraints"
```

---

### Task 3: Quiz Forms & Scores display

**Files:**
- Modify: `apps/web/src/pages/company/NewJob.tsx`
- Modify: `apps/web/src/pages/candidate/JobDetailsCandidate.tsx`
- Modify: `apps/web/src/pages/company/JobDetails.tsx`

**Interfaces:**
- Consumes: Quiz endpoints.
- Produces: Quiz creation forms and candidate answering dialogs.

- [ ] **Step 1: Answering UI**

When a candidate clicks "Candidatar-se" on a job with a quiz, show a Dialog listing the multiple-choice questions (max 4) before confirming application.

- [ ] **Step 2: Score Display**

Show `Score: X%` badges on the company dashboard next to applicants, allowing companies to click and review their detailed answers.

- [ ] **Step 3: Commit**

```bash
git commit -am "feat: integrate quiz creation and answering UI in frontend"
```
