# Frontend Implementation Design

## 1. Overview
This specification details the architecture and visual design for the frontend application (Phase 7). The application will be a highly premium, dark-mode-first platform where companies can post jobs and users can apply to them.

## 2. Technology Stack
- **Framework**: `Vite` with React and TypeScript. Optimized for token efficiency, minimal boilerplate, and fast SPA performance.
- **Routing**: `react-router-dom`.
- **UI Components**: `shadcn/ui` (built on top of Radix UI and TailwindCSS) for highly polished, accessible, and fast-to-develop components.
- **Global State / Auth**: Context API.
- **Data Fetching**: `@tanstack/react-query` combined with `axios` for client-side API communication.
- **Styling**: TailwindCSS.

## 3. Visual Identity & Aesthetic
- **Color Palette**: Deep dark grays (e.g., `slate-950` backgrounds, `slate-900` cards) accented by vibrant neon tones (e.g., a vibrant indigo or emerald for primary actions).
- **Typography**: Inter.
- **Premium Touches (Glassmorphism)**: Background blur on sticky headers and modals (using `bg-background/50 backdrop-blur-md`).
- **Micro-animations**: Smooth hover transitions natively provided by shadcn components and extended where needed.

## 4. Application Structure
### 4.1. Core Components (shadcn/ui)
- We will leverage the shadcn CLI to generate core elements: `Button`, `Input`, `Label`, `Card`, `Dialog`, `Sheet`, etc.

### 4.2. Routes & Pages
- **Public**:
  - `/` (Home): Landing page with call-to-actions.
  - `/login`: Authentication page.
  - `/register`: Registration.
- **User (Candidate) Protected**:
  - `/jobs`: Job listing board with filters.
  - `/jobs/:id`: Job detail page and "Apply" button.
- **Company Protected**:
  - `/dashboard`: Overview of company's posted jobs.
  - `/dashboard/jobs/new`: Form to create/publish a new job.
  - `/dashboard/jobs/:id`: View specific job and its applications (approve/reject).

## 5. Implementation Strategy
We will implement the frontend in iterative tasks:
1. **Foundation**: Setup Shadcn UI on the existing Vite app (path aliases `tsconfig.json` & `vite.config.ts`).
2. **UI Kit**: Generate necessary Shadcn components.
3. **Authentication**: Implement Login/Register flows.
4. **Candidate Flow**: Implement the job board and application flow.
5. **Company Flow**: Implement job creation and applicant management.
