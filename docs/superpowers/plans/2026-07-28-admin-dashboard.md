# Admin Dashboard Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Phase 1 Admin Panel including a protected dashboard route, a sidebar layout, and a dashboard displaying KPI cards and growth charts using data from a cached backend endpoint.

**Architecture:** We will create a protected `/admin` route group in the React frontend, an `AdminLayout` with a sidebar, and a `Dashboard` component using `recharts`. The backend will provide a protected `GET /admin/dashboard-metrics` endpoint that aggregates data via Prisma and caches it in Redis.

**Tech Stack:** NestJS, Prisma, Redis, React, React Router, React Query, Recharts, Tailwind CSS.

## Global Constraints

- Must use unit tests instead of e2e tests for the backend to save tokens.
- Must handle Prisma aggregation errors gracefully.
- Must use existing Sonner toast notifications in the frontend for feedback.

---

### Task 1: Create `AdminRouteGuard` (Frontend)

**Files:**
- Create: `apps/web/src/guards/AdminRouteGuard.tsx`
- Create: `apps/web/src/guards/AdminRouteGuard.spec.tsx`

**Interfaces:**
- Consumes: User context (assuming a `useAuth` or similar hook exists that provides `user.role`).
- Produces: A wrapper component that redirects to `/` if `user.role !== 'Admin'`, otherwise renders `children` or `<Outlet />`.

- [ ] **Step 1: Write the failing test**
      Create `apps/web/src/guards/AdminRouteGuard.spec.tsx` to test that non-admins are redirected and admins can render children.
      *Note: Assuming Vitest/RTL setup is standard.*

- [ ] **Step 2: Run test to verify it fails**
      Run: `cd apps/web && npm run test`
      Expected: FAIL.

- [ ] **Step 3: Write minimal implementation**
      Implement `AdminRouteGuard` checking for `user.role === 'Admin'` and using `Navigate` from `react-router-dom` to redirect if not authorized.

- [ ] **Step 4: Run test to verify it passes**
      Run: `cd apps/web && npm run test`
      Expected: PASS.

- [ ] **Step 5: Commit**
      Run: `git add apps/web/src/guards && git commit -m "feat(web): add AdminRouteGuard"`

### Task 2: Create Admin Layout and Routing (Frontend)

**Files:**
- Create: `apps/web/src/layouts/AdminLayout.tsx`
- Modify: `apps/web/src/App.tsx`

**Interfaces:**
- Consumes: `AdminRouteGuard`.
- Produces: The base `/admin` layout with a sidebar.

- [ ] **Step 1: Implement `AdminLayout.tsx`**
      Create a sidebar with links: Dashboard (`/admin`), Users, Moderation, Settings (these three can be disabled or `#` for now). The main content area should render `<Outlet />`.

- [ ] **Step 2: Update Router in `App.tsx`**
      Import `AdminLayout` and `AdminRouteGuard`.
      Add a route for `/admin` wrapped in `AdminRouteGuard`. Inside it, render `AdminLayout`.

- [ ] **Step 3: Verify visually**
      Run the app (`npm run dev`) and manually verify the layout renders when logged in as an Admin.

- [ ] **Step 4: Commit**
      Run: `git add apps/web/src && git commit -m "feat(web): add admin layout and routing"`

### Task 3: Create `AdminController` and `AdminService` with Caching (Backend)

**Files:**
- Create: `apps/api/src/admin/admin.controller.ts`
- Create: `apps/api/src/admin/admin.service.ts`
- Create: `apps/api/src/admin/admin.module.ts`
- Create: `apps/api/src/admin/admin.controller.spec.ts`
- Modify: `apps/api/src/app.module.ts`

**Interfaces:**
- Consumes: PrismaService, CacheManager (Redis).
- Produces: `GET /admin/dashboard-metrics` returning `{ totalUsers, totalJobs, totalApplications, usersOverTime: [...], jobsOverTime: [...] }`.

- [ ] **Step 1: Write the failing unit tests**
      Create `admin.controller.spec.ts` mocking `AdminService` and verifying the controller returns the expected shape.

- [ ] **Step 2: Run test to verify it fails**
      Run: `cd apps/api && npm run test`
      Expected: FAIL.

- [ ] **Step 3: Implement Module, Controller and Service**
      In `admin.controller.ts`, add `@Get('dashboard-metrics')` protected by `@UseGuards(JwtAuthGuard, RolesGuard)` and `@Roles(Role.Admin)`.
      In `admin.service.ts`, implement `getDashboardMetrics`. Use `this.cacheManager.get('admin:dashboard:metrics')`. If missing, fetch counts via `this.prisma.user.count()`, etc., and set cache with a 5-minute TTL.

- [ ] **Step 4: Run test to verify it passes**
      Run: `cd apps/api && npm run test`
      Expected: PASS.

- [ ] **Step 5: Commit**
      Run: `git add apps/api/src && git commit -m "feat(api): implement admin dashboard metrics endpoint"`

### Task 4: Create Dashboard Component (Frontend)

**Files:**
- Modify: `package.json` in `apps/web` (to add recharts)
- Create: `apps/web/src/pages/admin/Dashboard.tsx`
- Modify: `apps/web/src/App.tsx` (to route to Dashboard)

**Interfaces:**
- Consumes: `GET /admin/dashboard-metrics` endpoint.

- [ ] **Step 1: Install dependencies**
      Run: `cd apps/web && npm install recharts`

- [ ] **Step 2: Implement Dashboard Component**
      Use React Query `useQuery` to fetch `/admin/dashboard-metrics`.
      Render KPI cards for totals.
      Render a `LineChart` for `usersOverTime` and a `BarChart` for `jobsOverTime` using `recharts`.
      Handle loading states with text or simple skeletons. Handle errors with `toast.error` from Sonner.

- [ ] **Step 3: Update Routing**
      In `App.tsx`, add the `Dashboard` component as the index route for `/admin`.

- [ ] **Step 4: Verify visually**
      Run the app, log in as Admin, and navigate to `/admin`. Ensure data and charts render correctly.

- [ ] **Step 5: Commit**
      Run: `git add apps/web/package.json apps/web/package-lock.json apps/web/src && git commit -m "feat(web): implement admin dashboard with charts"`
