# Implementation Plan: Global Settings & Admins

## Task 1: Database Migration (Backend)
1. Modify `apps/api/src/infra/prisma/schema.prisma` to add the `GlobalConfig` model.
2. Use `npx prisma db push --accept-data-loss` to sync the database.
3. Run `npx prisma generate`.
4. Commit: "feat(db): add global config model"

## Task 2: Backend Settings & Admin Creation
1. Update `AdminService` and `AdminController` to include `getSettings`, `updateSettings`, and `createAdmin` endpoints.
2. Update `JobsService.create` to enforce the `minimumJobPriceCents` validation.
3. Update unit tests in `admin.controller.spec.ts` and `jobs.service.spec.ts`.
4. Run tests to ensure backend stability.
5. Commit: "feat(api): implement global settings and admin creation endpoints"

## Task 3: Global Settings Page (Frontend)
1. Create `apps/web/src/pages/admin/Settings.tsx`.
2. Implement data fetching and updating with React Query.
3. Build the form for `platformFeePercentage` and `minimumJobPriceCents`.
4. Update `AdminLayout.tsx` (sidebar link) and `App.tsx` (route).
5. Commit: "feat(web): add global settings page"

## Task 4: Create Admin Modal (Frontend)
1. Modify `apps/web/src/pages/admin/Users.tsx` to add a "Create Admin" button.
2. Create the `CreateAdminModal` component within the file.
3. Implement `useMutation` for `POST /admin/admins`.
4. Test the build (`npm run build`).
5. Commit: "feat(web): add create admin modal"
