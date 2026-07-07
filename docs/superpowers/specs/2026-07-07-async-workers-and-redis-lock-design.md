# Async Workers and Redis Lock Design

## 1. Overview
This specification covers the implementation of the missing tasks from Item 5 (RabbitMQ workers) and the foundational Redis requirements (Item 4) for the Hubb-Vagas project. The goal is to decouple the application lifecycle events (candidature, approval, job closing) using RabbitMQ and guarantee consistency during job closure using a Distributed Lock in Redis.

## 2. Architecture & Modules
To keep boundaries clean, we will organize the consumers and publishers as follows:
- **NotificationsModule**: A new module responsible exclusively for listening to domain events and sending out notifications (e.g., e-mails or webhooks).
- **JobsModule**: Will host the `JobClosureWorker` since job closure is a core business logic rule of the Job domain.
- **RedisModule**: A new custom module wrapping `ioredis` to provide a clean interface for Redis operations, specifically focusing on distributed locks.

## 3. Redis & Distributed Lock
- **Redis Client**: We will use `ioredis` configured via a NestJS custom provider inside `RedisModule`.
- **Lock Service**: We will implement a `LockService` that exposes an `acquireLock(key: string, ttl: number): Promise<boolean>` method using the `SETNX` command and a `releaseLock(key: string): Promise<void>` method.
- **Scope**: Caching of endpoints (list and details) will be deferred. Only the lock mechanism is required for this phase.

## 4. API & Publishers
- **ApplicationCreated (5.2.2)**: 
  - Emitted by `ApplicationsService.apply()`.
  - Consumed by `NotificationsModule` to send a confirmation e-mail to the candidate.
- **Application Approval Endpoint**:
  - `PATCH /jobs/:jobId/applications/:appId/approve` located in `JobsController`.
  - Must validate if the logged-in `Company` owns the job.
  - Emits the `ApplicationApproved` event (5.2.3).
- **JobClosed (5.2.4)**:
  - Emitted by the `JobClosureWorker` after a successful closure.
  - Consumed by `NotificationsModule` to notify relevant parties.

## 5. Job Closure Workflow (Worker 5.3.3)
1. **Event**: `ApplicationApproved` is received by the `JobClosureWorker`.
2. **Locking**: The worker attempts to acquire a lock using `LockService.acquireLock('job-lock:{jobId}', TTL)`.
3. **Execution**:
   - If acquired: Check if the job status is `PUBLISHED` in Postgres.
   - Update job status to `CLOSED_HIRED`.
   - Update other applications for this job to `REJECTED`.
   - Persist history in `JobStatusHistory`.
   - Emit `JobClosed` event.
   - Release the lock.
   - If NOT acquired: The worker gracefully skips or logs that another process is handling the closure.

## 6. Testing & Error Handling
- RabbitMQ queues will be configured as non-durable for now, as per the existing `accounts_queue` setup.
- If Redis is unavailable, the `LockService` should fail fast, and the worker should reject/requeue the message.
- E-mails in `NotificationsModule` will be mocked via `console.log` for this phase.
