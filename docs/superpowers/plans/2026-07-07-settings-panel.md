# Settings Panel Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Implement settings panels for users and companies to update their profiles and change passwords.

**Architecture:** Separate API endpoints for Users, Companies, and Accounts. Two distinct frontend routes for candidate and company settings panels.

**Tech Stack:** NestJS (Backend), React + React Router + React Query + Tailwind (Frontend).

## Global Constraints

- Must use existing Sonner toast notifications in the frontend for feedback.
- Must implement TDD (Test Driven Development) for backend tasks.
- No new tables are being created, only updates to `users`, `companies`, and `accounts`.

---

### Task 1: Create `PATCH /users/me` API Endpoint

**Files:**

- Create/Modify: `apps/api/src/users/users.controller.ts`
- Create/Modify: `apps/api/src/users/users.service.ts`
- Create/Modify: `apps/api/src/users/dto/update-user.dto.ts`
- Create/Modify: `apps/api/test/users/users.e2e-spec.ts`

**Interfaces:**

- Consumes: Authenticated user token (Role: User)
- Produces: Updated User object.

- [x] **Step 1: Write the failing test**
      Create an e2e test for `PATCH /users/me` in `apps/api/test/users/users.e2e-spec.ts` verifying it updates name, bio, and cpf.

- [x] **Step 2: Run test to verify it fails**
      Run: `cd apps/api && npm run test:e2e` (or equivalent test runner).
      Expected: FAIL.

- [x] **Step 3: Write minimal implementation**
      Implement `UpdateUserDto` using Zod/Class-validator.
      Add `updateProfile` method in `UsersService` calling Prisma `prisma.user.update`.
      Add `@Patch('me')` in `UsersController`.

- [x] **Step 4: Run test to verify it passes**
      Run: `cd apps/api && npm run test:e2e`.
      Expected: PASS.

- [x] **Step 5: Commit**
      Run: `git add apps/api/src/users apps/api/test && git commit -m "feat(api): implement PATCH /users/me endpoint"`

### Task 2: Create `PATCH /companies/me` API Endpoint

**Files:**

- Create/Modify: `apps/api/src/companies/companies.controller.ts`
- Create/Modify: `apps/api/src/companies/companies.service.ts`
- Create/Modify: `apps/api/src/companies/dto/update-company.dto.ts`
- Create/Modify: `apps/api/test/companies/companies.e2e-spec.ts`

**Interfaces:**

- Consumes: Authenticated company token (Role: Company)
- Produces: Updated Company object.

- [x] **Step 1: Write the failing test**
      Create an e2e test for `PATCH /companies/me` testing updates to name, contact, and cnpj.

- [x] **Step 2: Run test to verify it fails**
      Run: `cd apps/api && npm run test:e2e`.
      Expected: FAIL.

- [x] **Step 3: Write minimal implementation**
      Implement `UpdateCompanyDto`.
      Add `updateProfile` method in `CompaniesService`.
      Add `@Patch('me')` in `CompaniesController`.

- [x] **Step 4: Run test to verify it passes**
      Run: `cd apps/api && npm run test:e2e`.
      Expected: PASS.

- [x] **Step 5: Commit**
      Run: `git add apps/api/src/companies apps/api/test && git commit -m "feat(api): implement PATCH /companies/me endpoint"`

### Task 3: Create `PATCH /accounts/me/password` API Endpoint

**Files:**

- Create/Modify: `apps/api/src/accounts/accounts.controller.ts`
- Create/Modify: `apps/api/src/accounts/accounts.service.ts`
- Create/Modify: `apps/api/src/accounts/dto/update-password.dto.ts`
- Create/Modify: `apps/api/test/accounts/accounts.e2e-spec.ts`

**Interfaces:**

- Consumes: `currentPassword` and `newPassword`.
- Produces: Success confirmation message or 400 Error.

- [x] **Step 1: Write the failing test**
      Create an e2e test verifying password update with correct/incorrect `currentPassword`.

- [x] **Step 2: Run test to verify it fails**
      Run: `cd apps/api && npm run test:e2e`.
      Expected: FAIL.

- [x] **Step 3: Write minimal implementation**
      Implement `UpdatePasswordDto`.
      Add `updatePassword` in `AccountsService` verifying `bcrypt.compare` and hashing the new one.
      Add `@Patch('me/password')` in `AccountsController`.

- [x] **Step 4: Run test to verify it passes**
      Run: `cd apps/api && npm run test:e2e`.
      Expected: PASS.

- [x] **Step 5: Commit**
      Run: `git add apps/api/src/accounts apps/api/test && git commit -m "feat(api): implement password update endpoint"`

### Task 4: Frontend - Candidate Settings Page

**Files:**

- Create: `apps/web/src/pages/user/Settings.tsx`
- Modify: `apps/web/src/App.tsx` (or router file)
- Modify: `apps/web/src/services/api.ts` (to add patch methods)

**Interfaces:**

- Consumes: `PATCH /users/me`, `PATCH /accounts/me/password`

- [x] **Step 1: Implement API service methods**
      Add `updateUserProfile` and `updatePassword` to the API client in `apps/web`.

- [x] **Step 2: Create Settings UI Components**
      Create the `Settings.tsx` layout with "Perfil" and "Segurança" tabs.
      Implement `React Hook Form` + `zod` schema for name/bio/cpf.

- [x] **Step 3: Wire up React Query and Sonner**
      Use `useMutation` to handle submits. Call `toast.success` or `toast.error` on response.

- [x] **Step 4: Test manually and verify**
      Run the frontend app, log in as user, navigate to `/user/settings`, and submit profile changes. Verify visual feedback.

- [x] **Step 5: Commit**
      Run: `git add apps/web && git commit -m "feat(web): add candidate settings page"`

### Task 5: Frontend - Company Settings Page

**Files:**

- Create: `apps/web/src/pages/company/Settings.tsx`
- Modify: `apps/web/src/App.tsx` (or router file)

**Interfaces:**

- Consumes: `PATCH /companies/me`, `PATCH /accounts/me/password`

- [x] **Step 1: Implement API service method**
      Add `updateCompanyProfile` to the API client.

- [x] **Step 2: Create Company Settings UI**
      Create `Settings.tsx` for companies (similar layout but different form fields: CNPJ, contact, name).

- [x] **Step 3: Wire up React Query and Sonner**
      Connect form to the company mutation.

- [x] **Step 4: Test manually and verify**
      Log in as company, update profile, and test password change.

- [x] **Step 5: Commit**
      Run: `git add apps/web && git commit -m "feat(web): add company settings page"`
