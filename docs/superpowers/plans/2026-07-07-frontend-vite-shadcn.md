# Vite & Shadcn Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Configure Shadcn UI inside the existing Vite React application in `apps/web`.

---

### Task 1: Setup Path Aliases for Shadcn

Shadcn requires an `@/*` alias to resolve components correctly.

**Files:**
- Modify: `apps/web/tsconfig.json`
- Modify: `apps/web/tsconfig.app.json`
- Modify: `apps/web/vite.config.ts`

- [ ] **Step 1: Update TypeScript Configs**

Install `@types/node` inside `apps/web`:
```bash
cd apps/web
npm install -D @types/node
```

Update `apps/web/tsconfig.app.json` to include baseUrl and paths:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": [
        "./src/*"
      ]
    }
  }
}
```

- [ ] **Step 2: Update Vite Config**

Update `apps/web/vite.config.ts` to support aliases:
```typescript
import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

- [ ] **Step 3: Commit**

```bash
rtk git add -A
rtk git commit -m "build: add path aliases for shadcn ui"
```

---

### Task 2: Initialize Shadcn UI & Dependencies

**Actions:**
- Init Shadcn in `apps/web`
- Generate base components
- Install React Router, React Query, Axios

- [ ] **Step 1: Init Shadcn UI**

Run in terminal inside `apps/web`:
```bash
cd apps/web
npx shadcn-ui@latest init -y
```

- [ ] **Step 2: Add essential UI components**

```bash
cd apps/web
npx shadcn-ui@latest add button card input label form dialog
```

- [ ] **Step 3: Install Core Libraries**

```bash
cd apps/web
npm install react-router-dom axios @tanstack/react-query lucide-react
```

- [ ] **Step 4: Commit**

```bash
rtk git add -A
rtk git commit -m "feat: initialize shadcn and install core libs"
```
