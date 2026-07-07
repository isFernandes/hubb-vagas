# Jobs Caching Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Redis-based caching for Job listings (TTL 3 min) and Job details (TTL 1 hr), with explicit invalidation for updates.

**Architecture:** Inject `REDIS_CLIENT` into `JobsService` and `JobClosureWorker`. We will wrap Redis operations in try/catch to ensure graceful degradation if Redis goes down. We'll use Node's native `Buffer` to create base64 hashes for query filters.

**Tech Stack:** NestJS, ioredis.

---

### Task 1: Implement Cache Logic in JobsService

**Files:**
- Modify: `src/jobs/jobs.service.ts`

- [ ] **Step 1: Inject REDIS_CLIENT and update findAll/findOne/update/remove**

Modify `src/jobs/jobs.service.ts`:
```typescript
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { JobsRepository } from '../repositories/jobs.repository';
import { JobStatusHistoryRepository } from '../repositories/jobStatusHistory.repository';
import { JobStatus } from '../infra/prisma/generated/client';
import { ClientProxy } from '@nestjs/microservices';
import { Redis } from 'ioredis';

@Injectable()
export class JobsService {
  constructor(
    private readonly jobsRepository: JobsRepository,
    private readonly statusHistoryRepository: JobStatusHistoryRepository,
    @Inject('RMQ_CLIENT') private readonly client: ClientProxy,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async create(data: any, companyId: string, accountId: string) {
    const job = await this.jobsRepository.create({
      ...data,
      companyId,
      status: JobStatus.DRAFT,
    });

    await this.statusHistoryRepository.create({
      jobId: job.id,
      status: JobStatus.DRAFT,
      changedById: accountId,
      reason: 'Status inicial como DRAFT',
    });

    return job;
  }

  async findAll(filters?: {
    location?: string;
    contractType?: string;
    companyId?: string;
    search?: string;
    status?: any;
  }) {
    const filterString = filters ? JSON.stringify(filters) : '{}';
    const filtersHash = Buffer.from(filterString).toString('base64');
    const cacheKey = `job:list:${filtersHash}`;

    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.error(`[Redis Error] Failed to get cache for ${cacheKey}`, e);
    }

    const data = await this.jobsRepository.findAll(filters);

    try {
      await this.redis.setex(cacheKey, 180, JSON.stringify(data)); // 3 minutes TTL
    } catch (e) {
      console.error(`[Redis Error] Failed to set cache for ${cacheKey}`, e);
    }

    return data;
  }

  async findOne(id: string) {
    const cacheKey = `job:detail:${id}`;
    
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.error(`[Redis Error] Failed to get cache for ${cacheKey}`, e);
    }

    const job = await this.jobsRepository.findById(id);
    if (!job) {
      throw new NotFoundException('Vaga não encontrada');
    }

    try {
      await this.redis.setex(cacheKey, 3600, JSON.stringify(job)); // 1 hour TTL
    } catch (e) {
      console.error(`[Redis Error] Failed to set cache for ${cacheKey}`, e);
    }

    return job;
  }

  async update(id: string, data: any, companyId: string, accountId: string) {
    const job = await this.findOne(id);

    if (job.companyId !== companyId) {
      throw new ForbiddenException(
        'Você não tem permissão para alterar esta vaga',
      );
    }

    const updatedJob = await this.jobsRepository.update(id, data);

    if (data.status && data.status !== job.status) {
      await this.statusHistoryRepository.create({
        jobId: id,
        status: data.status,
        changedById: accountId,
        reason: 'Alteração de status via PATCH',
      });
    }

    // Invalidate Detail Cache
    try {
      await this.redis.del(`job:detail:${id}`);
    } catch (e) {
      console.error(`[Redis Error] Failed to invalidate cache for job:detail:${id}`, e);
    }

    return updatedJob;
  }

  async remove(id: string, companyId: string) {
    const job = await this.findOne(id);

    if (job.companyId !== companyId) {
      throw new ForbiddenException(
        'Você não tem permissão para excluir esta vaga',
      );
    }

    const result = await this.jobsRepository.remove(id);

    // Invalidate Detail Cache
    try {
      await this.redis.del(`job:detail:${id}`);
    } catch (e) {
      console.error(`[Redis Error] Failed to invalidate cache for job:detail:${id}`, e);
    }

    return result;
  }

  async approveApplication(jobId: string, appId: string, companyId: string) {
    const job = await this.findOne(jobId);
    if (job.companyId !== companyId) {
      throw new ForbiddenException('Você não tem permissão para alterar esta vaga');
    }
    
    this.client.emit('application_approved', { jobId, appId, companyId });
    return { message: 'Application approved successfully, processing job closure.' };
  }
}
```

- [ ] **Step 2: Commit**

```bash
rtk git add src/jobs/jobs.service.ts
rtk git commit -m "feat: implement caching logic in JobsService"
```

---

### Task 2: Invalidate Cache in JobClosureWorker

**Files:**
- Modify: `src/jobs/job-closure.worker.ts`

- [ ] **Step 1: Inject REDIS_CLIENT and delete cache key**

Modify `src/jobs/job-closure.worker.ts`:
```typescript
import { Controller, Inject } from '@nestjs/common';
import { EventPattern, Payload, ClientProxy } from '@nestjs/microservices';
import { LockService } from '../infra/redis/lock.service';
import { JobsRepository } from '../repositories/jobs.repository';
import { JobStatusHistoryRepository } from '../repositories/jobStatusHistory.repository';
import { PrismaService } from '../infra/prisma/prisma.service';
import { JobStatus } from '../infra/prisma/generated/client';
import { Redis } from 'ioredis';

@Controller()
export class JobClosureWorker {
  constructor(
    private readonly lockService: LockService,
    private readonly jobsRepository: JobsRepository,
    private readonly statusHistoryRepository: JobStatusHistoryRepository,
    private readonly prisma: PrismaService,
    @Inject('RMQ_CLIENT') private readonly client: ClientProxy,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  @EventPattern('application_approved')
  async handleApplicationApproved(@Payload() data: { jobId: string; appId: string; companyId: string }) {
    const { jobId, appId } = data;
    const lockKey = `job-lock:${jobId}`;

    const acquired = await this.lockService.acquireLock(lockKey, 30);
    if (!acquired) {
      console.log(`[JobClosureWorker] Job ${jobId} is already locked. Skipping.`);
      return;
    }

    try {
      const job = await this.jobsRepository.findById(jobId);
      if (job && job.status === JobStatus.PUBLISHED) {
        // Update Job Status
        await this.jobsRepository.update(jobId, { status: JobStatus.CLOSED_HIRED });
        
        // Update Applications (APPROVE the selected one, REJECT others)
        await this.prisma.application.update({ where: { id: appId }, data: { status: 'APPROVED' } });
        await this.prisma.application.updateMany({
          where: { jobId, id: { not: appId } },
          data: { status: 'REJECTED' },
        });

        // Record history
        const account = await this.prisma.company.findUnique({ where: { id: data.companyId } });
        if (account) {
          await this.statusHistoryRepository.create({
            jobId,
            status: JobStatus.CLOSED_HIRED,
            changedById: account.account_id,
            reason: 'Fechado automaticamente por aprovação de candidato',
          });
        }

        // Emit final event
        this.client.emit('job_closed', { jobId, hiredAppId: appId });
        
        // Invalidate detail cache
        try {
          await this.redis.del(`job:detail:${jobId}`);
        } catch (e) {
          console.error(`[Redis Error] Failed to invalidate cache for job:detail:${jobId}`, e);
        }

        console.log(`[JobClosureWorker] Job ${jobId} successfully closed.`);
      }
    } catch (e) {
      console.error(`[JobClosureWorker] Error closing job ${jobId}:`, e);
    } finally {
      await this.lockService.releaseLock(lockKey);
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
rtk git add src/jobs/job-closure.worker.ts
rtk git commit -m "feat: invalidate cache in job closure worker"
```

---

### Task 3: Update ToDo Checklist

**Files:**
- Modify: `ToDo.MD`

- [ ] **Step 1: Check off items 4.2 and 4.3**

Manually or via script update `ToDo.MD` to mark `- [x] 4.2 Implementar cache de listagem...` and `- [x] 4.3 Implementar cache de detalhe...`.

- [ ] **Step 2: Commit**

```bash
rtk git add ToDo.MD
rtk git commit -m "chore: mark task 4 items as complete"
```
