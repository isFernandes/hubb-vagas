# Implementation Plan: Moderation & Reporting System

## Task 1: Database Migration (Backend)
1. Modify `apps/api/src/infra/prisma/schema.prisma` to add `ReportType` and `ReportStatus` enums.
2. Add the `Report` model with relations to `Account` (reporter, reported, resolvedBy) and `Job`.
3. Use `npx prisma db push --accept-data-loss` (to bypass non-interactive mode warnings) and run `npx prisma generate`.
4. Commit: "feat(db): add report model for moderation system"

## Task 2: Backend API (Reports & Admin Module)
1. Create `ReportsModule`, `ReportsController`, and `ReportsService` for the public `POST /reports` endpoint.
2. Update `AdminController` and `AdminService` with `getReports` and `resolveReport` methods.
3. Write unit tests for the new endpoints.
4. Run tests to verify logic.
5. Commit: "feat(api): implement moderation and reporting endpoints"

## Task 3: Moderation Dashboard (Frontend)
1. Create `apps/web/src/pages/admin/Moderation.tsx`.
2. Implement data fetching with React Query (`useQuery` to `/admin/reports`).
3. Build the Data Table layout with columns: Reporter, Target, Type, Status, Date, Actions.
4. Update `AdminLayout.tsx` to enable the Moderation sidebar link.
5. Update `App.tsx` routing.
6. Commit: "feat(web): add admin moderation dashboard"

## Task 4: Report Review Modal (Frontend)
1. Create a `ReviewReportModal` component inside `Moderation.tsx`.
2. Implement `useMutation` to hit `PATCH /admin/reports/:id/resolve`.
3. Allow admins to read the full description, change status, and add notes.
4. Verify build (`npm run build`).
5. Commit: "feat(web): implement report review modal"
