# Improvement 3.1: Chat Interno Modularizado Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provide a decoupled, real-time messaging system inside the `chat` module, masking phone numbers/direct contacts until final hiring approval to protect platform privacy, and preparing the code to be split into a microservice.

**Architecture:**
1. Database: Add models `ChatRoom` and `Message` linked to room ID. Use simple strings for `applicationId` and `senderId` to decouple the database relations.
2. WebSockets: Build a NestJS WebSocket gateway `ChatGateway` using Socket.io to relay messages in real-time.
3. Decoupling: Create `ChatSecurityProvider` interface to validate statuses without importing external repositories directly.
4. Restrictions: Mask text containing emails, phone numbers, or external links using regex, replacing them with `[Contato Ocultado]` on dynamic read paths if application status is not approved.

**Tech Stack:** NestJS (@nestjs/websockets, socket.io), Prisma, React (socket.io-client)

---

### Task 1: Decoupled Chat Database Schema

**Files:**
- Modify: `apps/api/src/infra/prisma/schema.prisma`

**Interfaces:**
- Consumes: Prisma schema.
- Produces: `ChatRoom` and `Message` tables without external foreign keys.

- [ ] **Step 1: Write schema changes**

Update `schema.prisma` to add:
```prisma
model ChatRoom {
  id            String    @id @default(uuid())
  applicationId String    @unique // Decoupled text ID
  createdAt     DateTime  @default(now())
  messages      Message[]
}

model Message {
  id         String   @id @default(uuid())
  roomId     String
  room       ChatRoom @relation(fields: [roomId], references: [id])
  senderId   String   // Decoupled text ID
  content    String
  createdAt  DateTime @default(now())
}
```

- [ ] **Step 2: Migrate**

Run: `npx prisma migrate dev --name add_chat_messaging`
Expected: Database updated.

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/infra/prisma/schema.prisma
git commit -m "db: add decoupled chat database tables"
```

---

### Task 2: WebSockets Gateway and Decoupled Service

**Files:**
- Create: `apps/api/src/chat/chat-security.provider.ts`
- Create: `apps/api/src/chat/chat.gateway.ts`
- Create: `apps/api/src/chat/chat.module.ts`

**Interfaces:**
- Consumes: WebSockets messages.
- Produces: Real-time dynamic masked messages.

- [ ] **Step 1: Implement ChatSecurityProvider**

Create `chat-security.provider.ts` to abstract status lookups from other modules.

- [ ] **Step 2: Implement WebSockets Gateway**

Create `chat.gateway.ts` handling WebSocket events. Dynamically mask text containing contact data on read paths if status is not approved.

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/chat/
git commit -m "feat: implement WebSockets gateway and chat validation provider"
```

---

### Task 3: Chat controller and Frontend Component

**Files:**
- Create: `apps/api/src/chat/chat.controller.ts`
- Create: `apps/web/src/components/ChatOverlay.tsx`

**Interfaces:**
- Consumes: API controllers.
- Produces: Autonomously decoupled frontend chat modal.

- [ ] **Step 1: Implement ChatOverlay Component**

Create `ChatOverlay.tsx` using `socket.io-client` with a single entry parameter: `applicationId`. Render conversations dynamically.

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/ChatOverlay.tsx
git commit -m "feat: integrate decoupled chat UI on the frontend"
```
