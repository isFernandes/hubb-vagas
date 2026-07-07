# Next.js & Shadcn Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Vite frontend with Next.js and setup Shadcn UI.

---

### Task 1: Replace Vite with Next.js

**Actions:**
- Delete existing `apps/web`
- Run `create-next-app`

- [ ] **Step 1: Delete old folder and create Next.js App**

Run in terminal:
```bash
Remove-Item -Recurse -Force apps/web
cd apps
npx -y create-next-app@latest web --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

- [ ] **Step 2: Commit**

```bash
rtk git add -A
rtk git commit -m "feat: replace vite with next.js in apps/web"
```

---

### Task 2: Initialize Shadcn UI

**Actions:**
- Initialize Shadcn inside `apps/web`
- Generate base components

- [ ] **Step 1: Init Shadcn UI**

Run in terminal inside `apps/web`:
```bash
npx shadcn-ui@latest init -y
```

- [ ] **Step 2: Add essential components**

```bash
npx shadcn-ui@latest add button card input label form dialog
```

- [ ] **Step 3: Commit**

```bash
rtk git add -A
rtk git commit -m "feat: initialize shadcn ui and base components"
```
