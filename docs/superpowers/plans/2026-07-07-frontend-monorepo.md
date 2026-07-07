# Frontend & Monorepo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the repository into a Turborepo monorepo and initialize the minimalist React frontend.

---

### Task 1: Monorepo Root Configuration

**Files:**
- Create: `package.json` (Root)
- Create: `turbo.json` (Root)
- Create: `pnpm-workspace.yaml` (Se usar pnpm) ou configurar workspaces do NPM.

- [ ] **Step 1: Create Root Configurations**

Create the root `package.json` configured for NPM workspaces (assumindo npm based no lock anterior):
```json
{
  "name": "hubb-vagas-monorepo",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "start": "turbo run start",
    "lint": "turbo run lint"
  },
  "devDependencies": {
    "turbo": "latest"
  }
}
```

Create `turbo.json`:
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!-next/cache/**"]
    },
    "lint": {},
    "dev": {
      "cache": false,
      "persistent": true
    },
    "start": {
      "dependsOn": ["build"]
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
rtk git add package.json turbo.json
rtk git commit -m "chore: setup monorepo root configs"
```

---

### Task 2: Migrate Backend to apps/api

**Actions:**
- Create directory `apps/api`.
- Move NestJS files to `apps/api`.

- [ ] **Step 1: Move Files**

Move the following files/folders into `apps/api`:
- `src/`
- `test/`
- `nest-cli.json`
- `tsconfig.json`, `tsconfig.build.json`
- `package.json` (the original NestJS one)
- `package-lock.json`
- `.eslintrc.js`, `.prettierrc`
- `.env` (if applicable)

*Note:* Do not move `.git`, `.gitignore`, `docs/`, `ToDo.MD`, `GEMINI.md`, etc.

- [ ] **Step 2: Rename Backend Project**

In `apps/api/package.json`, change `"name": "hubb-vagas"` to `"name": "api"`. Ensure the dev script is `"dev": "nest start --watch"`.

- [ ] **Step 3: Commit**

```bash
rtk git add -A
rtk git commit -m "refactor: move backend to apps/api"
```

---

### Task 3: Initialize Frontend (apps/web)

**Actions:**
- Run Vite creation inside `apps/`

- [ ] **Step 1: Create Vite React App**

Run in terminal:
```bash
cd apps
npx -y create-vite@latest web --template react-ts
```

- [ ] **Step 2: Setup TailwindCSS v3**

Run in terminal inside `apps/web`:
```bash
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
```

Configure `tailwind.config.js` to enable dark mode and setup typography (e.g. Inter):
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

Update `src/index.css` with Tailwind directives and root variables for the dark minimalist theme:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-slate-950 text-slate-100 antialiased;
  }
}
```

- [ ] **Step 3: Commit**

```bash
rtk git add apps/web
rtk git commit -m "feat: initialize frontend with react, vite and tailwind v3"
```
