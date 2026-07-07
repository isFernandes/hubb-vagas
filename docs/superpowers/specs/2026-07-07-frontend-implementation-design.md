# Frontend Implementation Design

## 1. Overview
This specification details the architecture and visual design for the frontend application (Phase 7). The application will be a highly premium, dark-mode-first platform where companies can post jobs and users can apply to them.

## 2. Technology Stack
- **Framework**: `Next.js` (App Router). Replaces Vite and React Router, bringing SSR, SEO capabilities, and native routing.
- **UI Components**: `shadcn/ui` (built on top of Radix UI and TailwindCSS) for highly polished, accessible, and fast-to-develop components.
- **Global State / Auth**: Context API / Next.js Server Actions & Cookies for Auth state.
- **Data Fetching**: Next.js native `fetch` (Server Components) and `axios` for client-side mutations.
- **Styling**: TailwindCSS.

## 3. Visual Identity & Aesthetic
- **Color Palette**: Deep dark grays (e.g., `slate-950` backgrounds, `slate-900` cards) accented by vibrant neon tones (e.g., a vibrant indigo or emerald for primary actions).
- **Typography**: Inter (via `next/font`).
- **Premium Touches (Glassmorphism)**: Background blur on sticky headers and modals (using `bg-background/50 backdrop-blur-md`).
- **Micro-animations**: Smooth hover transitions natively provided by shadcn components and extended where needed.

## 4. Application Structure
### 4.1. Core Components (shadcn/ui)
- We will leverage the shadcn CLI to generate core elements: `Button`, `Input`, `Label`, `Card`, `Dialog`, `Sheet`, etc.

### 4.2. Routes & Pages (App Router)
- **Public**:
  - `app/page.tsx` (Home): Landing page with call-to-actions.
  - `app/(auth)/login/page.tsx`: Authentication page.
  - `app/(auth)/register/page.tsx`: Registration.
- **User (Candidate) Protected**:
  - `app/jobs/page.tsx`: Job listing board with filters.
  - `app/jobs/[id]/page.tsx`: Job detail page and "Apply" button.
- **Company Protected**:
  - `app/dashboard/page.tsx`: Overview of company's posted jobs.
  - `app/dashboard/jobs/new/page.tsx`: Form to create/publish a new job.
  - `app/dashboard/jobs/[id]/page.tsx`: View specific job and its applications (approve/reject).

## 5. Implementation Strategy
We will implement the frontend in iterative tasks:
1. **Foundation**: Replace existing Vite app with Next.js, setup Tailwind and Shadcn UI.
2. **UI Kit**: Generate necessary Shadcn components.
3. **Authentication**: Implement Login/Register flows.
4. **Candidate Flow**: Implement the job board and application flow.
5. **Company Flow**: Implement job creation and applicant management.
