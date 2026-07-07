# Frontend Implementation Design

## 1. Overview
This specification details the architecture and visual design for the React SPA (Phase 7). The application will be a highly premium, dark-mode-first platform where companies can post jobs and users can apply to them. 

## 2. Technology Stack
- **Routing**: `react-router-dom`
- **Global State**: React Context API (AuthContext to store user profile, role, and JWT token).
- **Data Fetching**: `@tanstack/react-query` combined with `axios` for fast API communication, caching, and retry logic.
- **Styling**: Custom components using TailwindCSS v3.

## 3. Visual Identity & Aesthetic
- **Color Palette**: Deep dark grays (e.g., `slate-950` backgrounds, `slate-900` cards) accented by vibrant neon tones (e.g., a vibrant indigo or emerald for primary actions).
- **Typography**: Inter (already configured in `tailwind.config.js`).
- **Premium Touches (Glassmorphism)**: Background blur on sticky headers and modals (using `bg-slate-900/50 backdrop-blur-md`).
- **Micro-animations**: Smooth hover transitions on buttons (`hover:-translate-y-0.5 transition-transform duration-200`) and skeleton loaders for data fetching.

## 4. Application Structure
### 4.1. Core Components (Reusable)
- `Button`: Standardized button with variants (primary, secondary, outline, glass).
- `Input` / `Label`: Form controls with error states.
- `Card`: A glass-like container for job postings and lists.
- `Navbar`: Sticky header with conditional rendering based on authentication state.

### 4.2. Routes & Pages
- **Public**:
  - `/` (Home): Landing page with call-to-actions.
  - `/login`: Authentication page.
  - `/register`: Registration (splits between Company and User).
- **User (Candidate) Protected**:
  - `/jobs`: Job listing board with filters.
  - `/jobs/:id`: Job detail page and "Apply" button.
- **Company Protected**:
  - `/dashboard`: Overview of company's posted jobs.
  - `/dashboard/jobs/new`: Form to create/publish a new job.
  - `/dashboard/jobs/:id`: View specific job and its applications (approve/reject).

## 5. Implementation Strategy
We will implement the frontend in iterative tasks:
1. **Foundation**: Setup Axios, React Query, Router, and Context API.
2. **UI Kit**: Build the base reusable components (Button, Input, Card).
3. **Authentication**: Implement Login/Register flows.
4. **Candidate Flow**: Implement the job board and application flow.
5. **Company Flow**: Implement job creation and applicant management.
