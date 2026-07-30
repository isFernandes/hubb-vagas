# Improvement 3.2: Notificações Multicanal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the notification service to support WhatsApp alerts (via generic webhook gateway) and Web Push Notifications (using web-push VAPID keys) for candidate application alerts.

**Architecture:**
1. Create a `WhatsappService` wrapper that calls a generic webhook URL from `.env` using simple HTTP POST requests.
2. Create database model `PushSubscription` linked to `Account` to persist VAPID credentials.
3. Hook `WhatsappService` and `PushNotificationService` inside the notifications worker `NotificationsConsumer` (which listens to RabbitMQ events).
4. Register a frontend Service Worker to handle browser Web Push alerts.

**Tech Stack:** NestJS, web-push node library, Axios, RabbitMQ, React

---

### Task 1: Whatsapp Integration Service (Generic Webhook)

**Files:**
- Create: `apps/api/src/notifications/whatsapp.service.ts`
- Modify: `apps/api/src/notifications/notifications.consumer.ts`

**Interfaces:**
- Consumes: `WHATSAPP_API_URL` and `WHATSAPP_API_TOKEN` env variables.
- Produces: `sendWhatsappMessage(toPhone: string, templateBody: string): Promise<void>`.

- [ ] **Step 1: Create WhatsappService wrapper**

```typescript
@Injectable()
export class WhatsappService {
  async send(to: string, message: string) {
    const url = process.env.WHATSAPP_API_URL;
    const token = process.env.WHATSAPP_API_TOKEN;
    if (!url || !token) {
      console.log(`[WhatsappMock] To: ${to}, Message: ${message}`);
      return;
    }
    await axios.post(url, { to, message }, { headers: { Authorization: `Bearer ${token}` } });
  }
}
```

- [ ] **Step 2: Trigger on RabbitMQ events**

Update `NotificationsConsumer` to trigger `whatsappService.send` when candidate is approved or rejected, using candidate's registered phone number.

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/notifications/
git commit -m "feat: implement WhatsappService notifications integration"
```

---

### Task 2: Web Push Notifications Database Schema and Controller

**Files:**
- Modify: `apps/api/src/infra/prisma/schema.prisma`
- Create: `apps/api/src/notifications/push.controller.ts`

**Interfaces:**
- Consumes: `POST /notifications/push-subscription` (saves push endpoint in Postgres).
- Produces: Dispatches browser push alerts using web-push package.

- [ ] **Step 1: Write schema changes**

Update `schema.prisma`:
```prisma
model PushSubscription {
  id        String   @id @default(uuid())
  accountId String
  account   Account  @relation(fields: [accountId], references: [id])
  endpoint  String   @unique
  p256dh    String
  auth      String
  createdAt DateTime @default(now())
}
```

- [ ] **Step 2: Run migrate**

Run: `npx prisma migrate dev --name add_push_subscriptions`
Expected: Database updated.

- [ ] **Step 3: Implement Web Push controller**

Create controller that saves VAPID keys subscriptions in the database. When events occur, use `web-push` NPM package to send push alerts.

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/infra/prisma/schema.prisma
git commit -m "db: add PushSubscription model for web push notifications"
```

---

### Task 3: Service Worker and Frontend Integration

**Files:**
- Modify: `apps/web/src/pages/candidate/Settings.tsx`
- Create: `apps/web/public/service-worker.js`

**Interfaces:**
- Consumes: Push subscription APIs.
- Produces: Service worker push alerts.

- [ ] **Step 1: Register Service Worker**

Register `service-worker.js` in frontend and request VAPID public key from backend to register candidate browser.

- [ ] **Step 2: Commit**

```bash
git commit -am "feat: implement service worker and push settings on the frontend"
```
