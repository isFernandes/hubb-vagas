# Improvement 3.3: Agendamento do Bico no Calendário Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate with Google Calendar (using OAuth2) to automatically schedule the gig/job execution period (`executionDate` and `durationHours`) directly in both the company's and candidate's calendars upon application approval.

**Architecture:**
1. OAuth2 integration: Authenticate company Google account and store credentials/tokens in `Company` database profile. Authenticate candidate Google account and store tokens in `User` profile.
2. Job Booking Service: When an application is approved (Checkout/payment finalized), the backend automatically connects to Google Calendar API (using `googleapis` library) and creates an event on both the company's and candidate's calendars, representing the scheduled gig shifts.

**Tech Stack:** NestJS, googleapis NPM library, Prisma, OAuth2

---

### Task 1: Google OAuth2 integrations for Profiles

**Files:**
- Modify: `apps/api/src/infra/prisma/schema.prisma`
- Create: `apps/api/src/auth/google-oauth.controller.ts`

**Interfaces:**
- Consumes: Google API credentials.
- Produces: Google OAuth refresh tokens stored in database.

- [ ] **Step 1: Update schema for tokens**

Add `googleRefreshToken String?` and `googleEmail String?` to both `Company` and `User` models.

- [ ] **Step 2: Implement OAuth callback**

Create redirection endpoints to Google OAuth consent screen, and handle code callback to exchange tokens and save them.

- [ ] **Step 3: Commit**

```bash
git commit -am "feat: implement Google Calendar OAuth2 flow for companies and candidates"
```

---

### Task 2: Auto-Schedule Gig in Calendar on Approval

**Files:**
- Create: `apps/api/src/companies/calendar-scheduler.service.ts`
- Modify: `apps/api/src/jobs/job-closure.worker.ts`

**Interfaces:**
- Consumes: Application approval event.
- Produces: Google Calendar event with gig shifts details.

- [ ] **Step 1: Calendar API scheduling integration**

Create service using `google.calendar` module. Authenticate client with company and candidate refresh tokens, insert event representing the job execution date and duration.

- [ ] **Step 2: Hook inside worker**

In `JobClosureWorker.handleApplicationApproved`, call `calendarSchedulerService.scheduleJob(...)` once a candidate is successfully approved.

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/companies/
git commit -m "feat: implement automatic Google Calendar gig scheduling service upon application approval"
```
