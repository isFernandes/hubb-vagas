# Improvement 5.2: Internacionalização (i18n) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement multi-language translation support (Portuguese and English) inside React frontend layouts and backend email notification templates.

**Architecture:**
1. Frontend: Setup `i18next` and `react-i18next` inside the React web app. Move UI hardcoded texts to resource files `locales/pt/translation.json` and `locales/en/translation.json`.
2. Backend: Configure NestJS mailer module to fetch translation keys depending on user's preferred language (persisted as `language` column on `Account` table).

**Tech Stack:** React, react-i18next, NestJS, Handlebars (email templates)

---

### Task 1: React i18n setup

**Files:**
- Create: `apps/web/src/i18n.ts`
- Create: `apps/web/public/locales/pt/translation.json`
- Create: `apps/web/public/locales/en/translation.json`
- Modify: `apps/web/src/main.tsx`

**Interfaces:**
- Consumes: Language selection.
- Produces: Translated DOM nodes.

- [ ] **Step 1: Configure i18next**

Create translation JSON assets mapping keys like `dashboard.title`, `jobs.create_button`. Initialize i18n in `main.tsx`:
```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
// i18n.use(initReactI18next).init({...})
```

- [ ] **Step 2: Apply Translation hooks**

Replace hardcoded UI values in home, job details, and registration pages using `useTranslation` hook:
```typescript
const { t } = useTranslation();
<h2>{t('dashboard.title')}</h2>
```

- [ ] **Step 3: Commit**

```bash
git commit -am "feat: implement frontend i18next translations"
```

---

### Task 2: Backend Template Translations

**Files:**
- Modify: `apps/api/src/infra/prisma/schema.prisma`
- Create: `apps/api/src/infra/i18n/pt.json` (and `en.json`)
- Modify: `apps/api/src/notifications/mailer.service.ts`

**Interfaces:**
- Consumes: User locale setting.
- Produces: Translated emails bodies.

- [ ] **Step 1: Support account language column**

Add `language String @default("pt")` to `Account` table.

- [ ] **Step 2: Translate template helper**

In `MailerService`, resolve translations before rendering templates using current user's target language config.

- [ ] **Step 3: Commit**

```bash
git commit -am "feat: add backend email notifications translations"
```
