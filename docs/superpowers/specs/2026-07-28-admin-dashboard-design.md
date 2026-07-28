# Admin Panel - Phase 1: Dashboard Design

## Overview
This document specifies the technical design for Phase 1 of the Admin Panel, focusing on the core admin infrastructure, routing, and the metrics dashboard.

## Scope
- Base admin layout with a sidebar.
- Frontend and backend authorization guards for the `Admin` role.
- Dashboard with high-level KPI cards and growth charts using `recharts`.
- Backend endpoint to aggregate metrics data with Redis caching.

## Architecture

### Frontend (UI & Routing)
- **Layout:** `AdminLayout.tsx` featuring a permanent sidebar. The sidebar will contain navigation links (Dashboard, Users, Moderation, Settings). Links for future phases will act as placeholders.
- **Routing:** A new `/admin` route group.
- **Protection:** `AdminRouteGuard` component will wrap the `/admin` routes. It will verify the user's JWT and ensure their role is `Admin`. If not, it redirects them.
- **Dashboard Component:** `apps/web/src/pages/admin/Dashboard.tsx`
  - **KPI Cards:** Displays total counts for Users, Companies, Active Jobs, and Applications.
  - **Charts Area:** Utilizes `recharts` to render:
    - Line chart for user registrations over the last 30 days.
    - Bar chart for job postings over the last 30 days.

### Backend (API & Data Flow)
- **Endpoint:** `GET /admin/dashboard-metrics` (in a new `AdminController`).
- **Security:** Protected by `JwtAuthGuard` and `RolesGuard(Role.Admin)`.
- **Database:** Prisma aggregations will be used to fetch total counts and time-series data grouped by date for the charts.
- **Caching:** The response will be cached in Redis using the key `admin:dashboard:metrics` with a TTL of 5 minutes to prevent expensive database aggregations on every load.

### Error Handling & Testing
- **Error Handling:**
  - Backend: Prisma aggregation errors will be caught and handled gracefully (returning empty arrays for charts).
  - Frontend: React Query will manage loading states (skeletons) and errors (Sonner toasts + retry mechanism).
- **Testing (Unit Tests Only):**
  - Backend: Unit tests for `AdminController` and `AdminService` mocking Prisma and Redis to ensure logic functions properly. E2E tests are intentionally omitted to save resources.
  - Frontend: Unit tests for `AdminRouteGuard` ensuring unauthorized redirection.
