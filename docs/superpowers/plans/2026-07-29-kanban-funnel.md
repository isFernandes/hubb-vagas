# Improvement 4.2: Funil de Contratação (Kanban) Board Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a visual drag-and-drop Kanban Board inside the company's job details page, allowing companies to transition candidates between recruiting phases (`APPLIED`, `SCREENING`, `APPROVED`, `REJECTED`).

**Architecture:**
1. Frontend: Integrate a lightweight drag-and-drop library (like `@hello-pangea/dnd` or custom HTML5 Drag and Drop APIs) inside `JobDetails.tsx`.
2. Group candidates into columns based on their application status.
3. Dragging a candidate card to a column triggers a `PATCH /applications/:id` API call to update status on the backend. If moved to `APPROVED`, it triggers checkout payment flow.

**Tech Stack:** React, TailwindCSS/Vanilla CSS, @hello-pangea/dnd

---

### Task 1: Drag and Drop Kanban Component

**Files:**
- Create: `apps/web/src/components/KanbanBoard.tsx`
- Modify: `apps/web/src/pages/company/JobDetails.tsx`

**Interfaces:**
- Consumes: Candidates array inside `JobDetails`.
- Produces: Visual board columns.

- [ ] **Step 1: Build KanbanBoard UI**

Create columns: "Triagem (APPLIED)", "Entrevista (SCREENING)", "Aprovados/Contratados (APPROVED)", "Rejeitados (REJECTED)".
Render candidate summaries inside cards.

- [ ] **Step 2: Add Drag Events**

On drag end, capture item ID and destination column. Invoke mutate hook to call patch status route on API.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/KanbanBoard.tsx
git commit -m "feat: implement drag-and-drop Kanban board for candidate funnel"
```
