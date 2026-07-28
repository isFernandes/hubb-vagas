# Admin User Management & Auditing (Phase 2)

## Overview
Phase 2 focuses on giving admins the ability to view, search, and manage user and company accounts. Admins can suspend or ban accounts, with an enforced audit log that tracks the reason and the administrator who performed the action.

## Database Schema Changes (Prisma)
1. **Enum `AccountStatus`:** `ACTIVE`, `SUSPENDED`, `BANNED`.
2. **`Account` Model Update:**
   - Add `status AccountStatus @default(ACTIVE)`
3. **New Model `AccountAuditLog`:**
   - `id` (UUID)
   - `accountId` (String) -> relation to `Account` (the target user)
   - `adminId` (String) -> relation to `Account` (the admin who made the change)
   - `previousStatus` (AccountStatus)
   - `newStatus` (AccountStatus)
   - `reason` (String)
   - `createdAt` (DateTime)

## API Endpoints (AdminController)
1. **`GET /admin/users`**
   - **Query Params:** `page`, `limit`, `search` (email/name)
   - **Response:** Paginated list of accounts, including `User` or `Company` relation data, and `status`.
2. **`PATCH /admin/users/:id/status`**
   - **Body:** `{ status: 'SUSPENDED' | 'BANNED' | 'ACTIVE', reason: 'String' }`
   - **Behavior:** Updates the target account's status, creates an entry in `AccountAuditLog`, and returns the updated account.

## Frontend (React Web App)
1. **Users Page (`/admin/users`)**
   - A Data Table displaying: Email, Role (User/Company), Status (with color badges), and Created At.
   - Search bar for filtering by email.
   - Pagination controls.
2. **Status Change Modal**
   - When an admin clicks "Change Status" on a user row, a modal prompts them to select the new status and input a mandatory text `reason` for the audit log.
3. **Route Updates**
   - Update `AdminLayout` sidebar to make "Users" clickable and active.
   - Add `<AdminUsers />` component to `App.tsx` routes.
