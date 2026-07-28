# Implementation Plan: Admin User Management

## Task 1: Database Migration (Backend)
1. Modify `apps/api/prisma/schema.prisma` to add `AccountStatus` enum, update `Account` model, and add `AccountAuditLog` model.
2. Run `npm run migrate:dev --name add_account_status_and_audit` inside `apps/api`.
3. Verify Prisma client generated successfully.
4. Commit: "feat(db): add account status and audit log models"

## Task 2: Backend API Endpoints (Admin Module)
1. Add `AccountAuditLog` creation capability to Prisma service (if not auto-generated).
2. Create unit tests for `getUsers` and `updateUserStatus` in `admin.controller.spec.ts`.
3. Implement `getUsers(page, limit, search)` in `admin.service.ts` and expose it via `GET /admin/users`.
4. Implement `updateUserStatus(id, newStatus, reason, adminId)` in `admin.service.ts` and expose it via `PATCH /admin/users/:id/status`.
5. Run tests (`npm run test -- admin.controller`) to verify logic.
6. Commit: "feat(api): add admin endpoints for user management"

## Task 3: Users Data Table (Frontend)
1. Create `apps/web/src/pages/admin/Users.tsx`.
2. Implement data fetching with React Query (`useQuery` to `/admin/users`).
3. Build the Data Table layout with columns: Email, Type, Status Badge, Joined Date, Actions.
4. Update `AdminLayout.tsx` to enable the Users sidebar link.
5. Update `App.tsx` routing.
6. Verify locally.
7. Commit: "feat(web): add admin users list page"

## Task 4: Status Management Modal (Frontend)
1. Create a `ChangeStatusModal` component inside `Users.tsx` (or as a separate component).
2. Implement `useMutation` to hit `PATCH /admin/users/:id/status`.
3. Ensure the form mandates a `reason` and handles API errors via Sonner toast.
4. Refetch the users query on success.
5. Verify build (`npm run build`).
6. Commit: "feat(web): implement user status change modal"
