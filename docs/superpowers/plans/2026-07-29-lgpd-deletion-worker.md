# Improvement 1.1: Worker de Exclusão (LGPD) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provide compliance with LGPD (Brazilian Data Protection Law) by creating an asynchronous deletion worker that anonymizes a user's personal data upon request (right to be forgotten), while preserving transaction history for accounting.

**Architecture:**
1. A candidate clicks "Excluir minha conta" in their settings. The backend updates the account status to `BANNED`/`SUSPENDED` (or a new status `DELETION_PENDING`) and publishes a `user_deletion_requested` event.
2. A background RabbitMQ consumer `LgpdDeletionConsumer` handles the event.
3. It anonymizes sensitive columns in the `User` and `Account` tables (sets email to random hash, name to "Usuário Anonimizado", deletes bio, cpf, avatarUrl, etc.) but preserves relations with `Application` and `Transaction` models for financial compliance.

**Tech Stack:** NestJS, Prisma, RabbitMQ, Vitest

---

### Task 1: Event Publisher & Trigger

**Files:**
- Modify: `apps/api/src/users/users.service.ts`

**Interfaces:**
- Consumes: `DELETE /users/profile`
- Produces: Emits `user_deletion_requested` message.

- [ ] **Step 1: Write service update**

```typescript
async requestAccountDeletion(userId: string) {
  await this.prisma.account.update({
    where: { id: userId },
    data: { status: 'SUSPENDED' } // deactivate immediately
  });
  this.client.emit('user_deletion_requested', { userId });
}
```

- [ ] **Step 2: Commit**

```bash
git commit -am "feat: implement deletion request trigger and event publisher"
```

---

### Task 2: LGPD Deletion Consumer

**Files:**
- Create: `apps/api/src/users/lgpd-deletion.worker.ts`
- Create: `apps/api/src/users/lgpd-deletion.worker.spec.ts`

**Interfaces:**
- Consumes: `user_deletion_requested` event.
- Produces: Anonymized database records.

- [ ] **Step 1: Implement worker logic**

Create `apps/api/src/users/lgpd-deletion.worker.ts`:
```typescript
@EventPattern('user_deletion_requested')
async handleDeletionRequest(@Payload() data: { userId: string }) {
  const { userId } = data;
  await this.prisma.user.update({
    where: { id: userId },
    data: {
      name: 'Usuário Anonimizado',
      cpf: null,
      avatarUrl: null,
      bio: null,
    }
  });
  await this.prisma.account.update({
    where: { user: { id: userId } },
    data: {
      email: `anonymous-${userId}@hubbvagas.com`,
      password: 'ANONYMIZED_PASSWORD_HASH',
      status: 'BANNED'
    }
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/api/src/users/lgpd-deletion.worker.ts
git commit -m "feat: implement background LGPD deletion worker"
```
