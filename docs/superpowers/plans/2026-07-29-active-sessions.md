# Improvement 1.2: Controle de Sessões Ativas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provide an active sessions management dashboard where users can view logged connections and revoke active JWT tokens remotely via Redis.

**Architecture:**
1. Upon login, the system creates a session token containing a unique ID (`jti`) and registers it in Redis: `user:sessions:{userId}:{jti}` with a TTL matching the JWT expiration.
2. We modify `JwtAuthGuard` to verify if the token's `jti` is still active in Redis.
3. Expose endpoint `/auth/sessions` (GET to list sessions, DELETE to revoke). Revoking a session simply deletes the `jti` key from Redis.

**Tech Stack:** NestJS, Redis, React

---

### Task 1: Redis Session Registration and JWT Guard Check

**Files:**
- Modify: `apps/api/src/auth/auth.service.ts`
- Modify: `apps/api/src/guards/jwt-auth.guard.ts`

**Interfaces:**
- Consumes: Redis client.
- Produces: JWT validation integrated with Redis session storage.

- [ ] **Step 1: Save session to Redis on Login**

In `auth.service.ts`, append to token signing:
```typescript
const jti = uuid();
await this.redis.setex(`user:sessions:${userId}:${jti}`, 86400, JSON.stringify({ ip, userAgent, createdAt: new Date() }));
```

- [ ] **Step 2: Check session in JwtAuthGuard**

In `jwt-auth.guard.ts`, extract `jti` from payload and verify:
```typescript
const exists = await this.redis.get(`user:sessions:${payload.sub}:${payload.jti}`);
if (!exists) throw new UnauthorizedException('Sessão revogada ou expirada.');
```

- [ ] **Step 3: Commit**

```bash
git commit -am "feat: implement Redis active sessions tracking in auth flow"
```

---

### Task 2: Session List and Revoke Endpoints

**Files:**
- Create: `apps/api/src/auth/sessions.controller.ts`

**Interfaces:**
- Consumes: HTTP endpoints GET `/auth/sessions`, DELETE `/auth/sessions/:jti`
- Produces: JSON response of active sessions.

- [ ] **Step 1: Implement SessionsController**

Create `apps/api/src/auth/sessions.controller.ts` and add routes:
- `GET /auth/sessions` scans `user:sessions:${userId}:*` and parses connection metadata.
- `DELETE /auth/sessions/:jti` deletes target key from Redis.

- [ ] **Step 2: Commit**

```bash
git add apps/api/src/auth/sessions.controller.ts
git commit -m "feat: expose sessions API list and revoke endpoints"
```
