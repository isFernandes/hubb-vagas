# Company Flow Implementation Plan (7.2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the screens for the Company role to manage jobs and applicants.

---

### Task 1: Company Dashboard (Job List)

**Files:**
- Create: `apps/web/src/pages/company/Dashboard.tsx`

- [ ] **Step 1: Create Dashboard**
  - Use React Query to fetch `GET /jobs/company/:companyId` (Requires adding a company-specific endpoint or filtering `GET /jobs` by company). Wait, checking backend: the backend `GET /jobs` has filters. Does it have a `/jobs` for company only? Let's check backend routes. 
  - *Note:* If backend endpoint is just `/jobs` with a `companyId` query, use that.
  - Render a table or list of Cards showing Job Title, Status, and Expiration Date.
  - Add "Criar Nova Vaga" button.

### Task 2: Create New Job

**Files:**
- Create: `apps/web/src/pages/company/NewJob.tsx`

- [ ] **Step 1: Create Form**
  - Form fields: title, description, requirements, location, contractType, expirationDate.
  - Use React Query `useMutation` to `POST /jobs`.
  - On success, redirect back to Dashboard.

### Task 3: Job Details and Applicant Management

**Files:**
- Create: `apps/web/src/pages/company/JobDetails.tsx`

- [ ] **Step 1: View Job Details**
  - Fetch job details via `GET /jobs/:id`.
  - Render job info.
  
- [ ] **Step 2: List and Manage Applicants**
  - Fetch applications via `GET /jobs/:id/applications` (verify backend endpoint).
  - For each application, show candidate info and Status.
  - Add "Aprovar" button that calls `PATCH /applications/:id/approve` or similar.

### Task 4: Integrate Routes

- [ ] **Step 1: Update App.tsx**
  - Add routes `/dashboard`, `/dashboard/jobs/new`, and `/dashboard/jobs/:id`.
