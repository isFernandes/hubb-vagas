# Improvement 4.3: Analytics de Recrutamento Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provide recruitment intelligence metrics for companies (Time-to-Hire, application conversion rate, funnel drop-off stats) and export data to CSV.

**Architecture:**
1. Database: Query `JobStatusHistory` and application timestamps to compute duration metrics.
2. Endpoint: `/companies/analytics` computes metrics using Prisma aggregates and exports details.
3. Frontend: Display dashboard charts using a simple chart library or svg plots, with a "Exportar Relatório CSV" button.

**Tech Stack:** NestJS, Prisma, React, CSV stringification

---

### Task 1: Analytics Aggregations Endpoint

**Files:**
- Create: `apps/api/src/companies/analytics.controller.ts`
- Create: `apps/api/src/companies/analytics.service.ts`

**Interfaces:**
- Consumes: HTTP GET `/companies/analytics`
- Produces: JSON analytics format and CSV download responses.

- [ ] **Step 1: Calculate recruitment metrics**

Compute Time-to-Hire (average gap between job publication and final approval in hours/days). Calculate conversion rate (applications count vs hired candidates).

- [ ] **Step 2: Implement CSV export endpoint**

Add GET `/companies/analytics/export` compiling all candidates information, status, and duration info, sending it with header `Content-Type: text/csv`.

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/companies/analytics.ts
git commit -m "feat: implement recruitment metrics backend service and CSV exports"
```

---

### Task 2: Company Analytics Page

**Files:**
- Modify: `apps/web/src/pages/company/Dashboard.tsx`
- Create: `apps/web/src/pages/company/Analytics.tsx`

**Interfaces:**
- Consumes: Analytics backend endpoints.
- Produces: Projections charts, export buttons in company dashboard.

- [ ] **Step 1: Render charts**

Create visual KPI cards (Time-to-hire, conversion rate). Build bar charts representing active job applicant volumes.

- [ ] **Step 2: Commit**

```bash
git commit -am "feat: implement analytics metrics charts and downloads in frontend"
```
