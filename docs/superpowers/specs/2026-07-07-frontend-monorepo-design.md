# Frontend & Monorepo Architecture Design

## 1. Overview
This specification outlines the transition of the current Hubb Vagas backend into a Monorepo structure using Turborepo, and the introduction of a new minimalist, mobile-first, and dark-mode-first React frontend.

## 2. Monorepo Refactoring
- **Tool**: Turborepo
- **Workspace Structure**:
  - `/apps/api`: The existing NestJS backend application. All current root configuration files (`package.json`, `tsconfig.json`, `nest-cli.json`, `src/`, etc.) will be moved here.
  - `/apps/web`: The new frontend application.
  - `/packages/*`: Future shared packages (e.g., shared TypeScript types, ESLint configs).
- **Root Configurations**: A new root `package.json` with workspace definitions (`pnpm`, `npm`, or `yarn` workspaces) and a `turbo.json` file to orchestrate build/dev scripts.

## 3. Frontend Technology Stack
- **Framework**: React with TypeScript.
- **Build Tool**: Vite (for fast HMR and optimal SPA performance).
- **Styling**: TailwindCSS v3.
- **Routing**: React Router (or TanStack Router).

## 4. Design Guidelines
- **Aesthetic**: Minimalist and highly premium. Avoid visual clutter.
- **Dark Mode First**: Default color palette will be based on deep dark grays/blacks (e.g., Tailwind's `slate-900` or custom HSL) with high-contrast, vibrant primary accents (e.g., neon blue or purple).
- **Mobile First**: Layouts will be designed for mobile viewports initially, scaling up via Tailwind's `md:`, `lg:` breakpoints.
- **Premium Touches**: 
  - Subtle glassmorphism on modals and floating cards (`backdrop-blur`).
  - Micro-animations for hover states and transitions.
  - Modern typography (e.g., `Inter` or `Outfit` via Google Fonts).

## 5. Development Workflow
- Running `turbo run dev` at the root will concurrently spin up the NestJS backend and the Vite frontend.
