# Moderation & Reporting System (Phase 3)

## Overview
Phase 3 introduces a robust moderation system (Item 13.4) to handle user complaints such as fake jobs, no-shows, or harassment. It allows users and companies to submit reports, which admins can then review, investigate, and resolve from the Admin Panel.

## Database Schema Changes (Prisma)
1. **Enums:**
   - `ReportType`: `FAKE_JOB`, `NO_SHOW`, `HARASSMENT`, `OTHER`
   - `ReportStatus`: `PENDING`, `INVESTIGATING`, `RESOLVED`, `DISMISSED`
2. **New Model `Report`:**
   - `id` (UUID)
   - `reporterId` (String) -> relation to `Account` (who submitted the report)
   - `reportedAccountId` (String?) -> optional relation to `Account` (the offender)
   - `reportedJobId` (String?) -> optional relation to `Job` (if the report is about a specific job)
   - `type` (ReportType)
   - `description` (String) -> detailed explanation of the issue
   - `status` (ReportStatus) @default(PENDING)
   - `resolvedById` (String?) -> relation to `Account` (the admin who resolved it)
   - `resolutionNotes` (String?) -> admin's notes upon resolution
   - `createdAt` (DateTime)
   - `updatedAt` (DateTime)

## API Endpoints
1. **`POST /reports` (Public/User/Company)**
   - **Body:** `{ reportedAccountId?: string, reportedJobId?: string, type: ReportType, description: string }`
   - **Behavior:** Creates a new report. Auth required (JwtAuthGuard).
2. **`GET /admin/reports` (Admin)**
   - **Query Params:** `page`, `limit`, `status` (optional filter)
   - **Response:** Paginated list of reports including reporter and target details.
3. **`PATCH /admin/reports/:id/resolve` (Admin)**
   - **Body:** `{ status: 'RESOLVED' | 'DISMISSED' | 'INVESTIGATING', notes?: string }`
   - **Behavior:** Updates report status and notes. Records the admin who took the action.

## Frontend (React Web App)
1. **Moderation Page (`/admin/moderation`)**
   - Data Table displaying: Reporter, Target, Type, Status, and Date.
   - Filters to view PENDING/RESOLVED reports.
2. **Review Modal**
   - Click to view full report description.
   - Select a new status (e.g., RESOLVED) and input resolution notes.
3. **Route Updates**
   - Add "Moderation" link to `AdminLayout` sidebar.
   - Add `<AdminModeration />` to `App.tsx` routes.
