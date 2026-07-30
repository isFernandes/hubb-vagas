# Improvement 6.5: PostHog Observability Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate PostHog inside the React frontend to capture user navigation, error tracking, Web Vitals, and Session Replays for rich visual debugging.

**Architecture:**
1. Frontend: Install `posthog-js` SDK.
2. Initialization: Initialize PostHog globally inside `main.tsx` using env configurations (`VITE_POSTHOG_KEY` and `VITE_POSTHOG_HOST`).
3. User Identification: Call `posthog.identify` after user logins or profile resolution. Call `posthog.reset` on logout.

**Tech Stack:** React, posthog-js SDK

---

### Task 1: PostHog Initialization & Configuration

**Files:**
- Modify: `apps/web/package.json`
- Modify: `apps/web/src/main.tsx`

**Interfaces:**
- Consumes: PostHog environment keys.
- Produces: Dispatched tracking events and session recordings.

- [ ] **Step 1: Install posthog-js**

Run: `npm install posthog-js --workspace=apps/web`
Expected: Dependencies updated.

- [ ] **Step 2: Initialize PostHog in main.tsx**

Initialize PostHog if variables are defined:
```typescript
import posthog from 'posthog-js';

if (import.meta.env.VITE_POSTHOG_KEY) {
  posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
    capture_performance: true,
  });
}
```

- [ ] **Step 3: Commit**

```bash
git commit -am "feat: install and initialize PostHog SDK in React frontend"
```

---

### Task 2: Session Tracking & Login Identification

**Files:**
- Modify: `apps/web/src/pages/Login.tsx` (or auth provider where login is stored)
- Modify: `apps/web/src/components/Header.tsx` (logout check)

**Interfaces:**
- Consumes: User login account details.
- Produces: Traced session replay ids.

- [ ] **Step 1: Identify users on login**

When user logs in successfully, trigger:
```typescript
posthog.identify(user.id, {
  email: user.email,
  role: user.role
});
```

- [ ] **Step 2: Reset on logout**

Trigger `posthog.reset()` when user logs out.

- [ ] **Step 3: Commit**

```bash
git commit -am "feat: implement PostHog user identification and session mapping"
```
