# Improvement 6.4: Monitoramento Sintético e Alertas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a synthetic monitoring script that periodically runs critical user flow checks (login, list jobs, create applications) and dispatches incident alerts directly to Slack/PagerDuty in case of failures.

**Architecture:**
1. Create a NestJS service `SlackAlertsService` that sends webhooks to Slack.
2. Build a synthetic testing script `synthetics.ts` (using Playwright or simple axios requests) running as a cron job inside a separate background loop, testing endpoints.
3. If synthetics fail, dispatch error stack and status codes to Slack notification channel.

**Tech Stack:** NestJS, Axios, Slack Webhook, cron trigger

---

### Task 1: Slack Alerts and Synthetic Pings

**Files:**
- Create: `apps/api/src/infra/monitoring/slack-alerts.service.ts`
- Create: `apps/api/src/infra/monitoring/synthetics.ts`

**Interfaces:**
- Consumes: Slack webhook integration URL.
- Produces: Dispatches notifications on failures.

- [ ] **Step 1: Implement Slack alert service**

```typescript
@Injectable()
export class SlackAlertsService {
  async sendIncident(errorMsg: string) {
    // POST request to incoming webhook URL
  }
}
```

- [ ] **Step 2: Add synthetics check cron**

Set up a task checker that makes pings (e.g. checks `/health` and attempts login endpoint). If response is not 200 or times out, trigger `slackAlertsService.sendIncident`.

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/infra/monitoring/
git commit -m "feat: implement synthetic monitoring cron and Slack alert integration"
```
