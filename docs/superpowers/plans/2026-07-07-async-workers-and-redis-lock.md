# Async Workers and Redis Lock Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement RabbitMQ workers to handle application creation, approval, and job closure, backed by a Redis distributed lock.

**Architecture:** We will introduce a `RedisModule` with `LockService` using `ioredis`. We will expand `MessagingModule` to provide a generic RMQ client. We will create a `NotificationsModule` to consume notification events. Finally, we will implement the `JobClosureWorker` in the `JobsModule` which consumes approval events and atomically closes the job.

**Tech Stack:** NestJS, RabbitMQ (`@nestjs/microservices`), `ioredis`, Prisma, Jest.

---

### Task 1: Add Dependencies and Generic RMQ Client

**Files:**
- Modify: `package.json`
- Modify: `src/infra/messaging/messaging.module.ts`

- [ ] **Step 1: Install ioredis**

```bash
rtk npm install ioredis
rtk npm install -D @types/ioredis
```
Expected: PASS

- [ ] **Step 2: Add RMQ_CLIENT to MessagingModule**

Modify `src/infra/messaging/messaging.module.ts` to expose `RMQ_CLIENT`:

```typescript
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'ACCOUNTS_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL') || 'amqp://guest:guest@localhost:5672'],
            queue: 'accounts_queue',
            queueOptions: { durable: false },
          },
        }),
      },
      {
        name: 'RMQ_CLIENT',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL') || 'amqp://guest:guest@localhost:5672'],
            queue: 'hubb_events_queue',
            queueOptions: { durable: false },
          },
        }),
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class MessagingModule {}
```

- [ ] **Step 3: Update `main.ts` to listen to the new queue**

Modify `src/main.ts` line 24 to connect the second microservice:

```typescript
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitmqUrl],
      queue: 'hubb_events_queue',
      queueOptions: { durable: false },
    },
  });
```

- [ ] **Step 4: Commit**
```bash
rtk git add package.json package-lock.json src/infra/messaging/messaging.module.ts src/main.ts
rtk git commit -m "chore: add ioredis and setup RMQ_CLIENT"
```

---

### Task 2: Redis Module and Lock Service

**Files:**
- Create: `src/infra/redis/redis.module.ts`
- Create: `src/infra/redis/lock.service.ts`
- Modify: `src/app.module.ts`

- [ ] **Step 1: Create `lock.service.ts`**

```typescript
import { Injectable, Inject, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class LockService implements OnModuleDestroy {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async acquireLock(key: string, ttlSeconds: number): Promise<boolean> {
    const result = await this.redis.set(key, 'locked', 'EX', ttlSeconds, 'NX');
    return result === 'OK';
  }

  async releaseLock(key: string): Promise<void> {
    await this.redis.del(key);
  }

  onModuleDestroy() {
    this.redis.disconnect();
  }
}
```

- [ ] **Step 2: Create `redis.module.ts`**

```typescript
import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { LockService } from './lock.service';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        return new Redis(configService.get<string>('REDIS_URL') || 'redis://localhost:6379');
      },
      inject: [ConfigService],
    },
    LockService,
  ],
  exports: ['REDIS_CLIENT', LockService],
})
export class RedisModule {}
```

- [ ] **Step 3: Import in `app.module.ts`**

Add `RedisModule` to the `imports` array in `src/app.module.ts`.

- [ ] **Step 4: Commit**
```bash
rtk git add src/infra/redis src/app.module.ts
rtk git commit -m "feat: implement RedisModule and LockService"
```

---

### Task 3: Emit `ApplicationCreated`

**Files:**
- Modify: `src/applications/applications.module.ts`
- Modify: `src/applications/applications.service.ts`

- [ ] **Step 1: Import MessagingModule in ApplicationsModule**

Modify `src/applications/applications.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { PrismaModule } from '../infra/prisma/prisma.module';
import { MessagingModule } from '../infra/messaging/messaging.module';

@Module({
  imports: [PrismaModule, MessagingModule],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
})
export class ApplicationsModule {}
```

- [ ] **Step 2: Inject and emit in ApplicationsService**

Modify `src/applications/applications.service.ts` to inject `RMQ_CLIENT` and emit:

```typescript
import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { ApplicationsRepository } from '../repositories/applications.repository';
import { JobsRepository } from '../repositories/jobs.repository';
import { JobStatus } from '../infra/prisma/generated/client';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly applicationsRepository: ApplicationsRepository,
    private readonly jobsRepository: JobsRepository,
    @Inject('RMQ_CLIENT') private readonly client: ClientProxy,
  ) {}

  async apply(jobId: string, userId: string) {
    if (!userId) throw new BadRequestException('Usuário não possui perfil de candidato ativo');
    
    const job = await this.jobsRepository.findById(jobId);
    if (!job) throw new NotFoundException('Vaga não encontrada');
    if (job.status !== JobStatus.PUBLISHED) throw new BadRequestException('Não é possível candidatar-se a uma vaga que não está publicada');

    const existingApplication = await this.applicationsRepository.findByUserAndJob(userId, jobId);
    if (existingApplication) throw new BadRequestException('Você já se candidatou a esta vaga');

    const application = await this.applicationsRepository.create({ userId, jobId });
    
    this.client.emit('application_created', { applicationId: application.id, jobId, userId });

    return application;
  }
}
```

- [ ] **Step 3: Run Tests**
```bash
rtk npm run test
```
*(Tests may need mock updates if they fail due to RMQ_CLIENT. If they fail, update the mock in `applications.service.spec.ts` in a subsequent commit).*

- [ ] **Step 4: Commit**
```bash
rtk git add src/applications/
rtk git commit -m "feat: emit application_created event"
```

---

### Task 4: Notifications Module (with NodeMailer)

**Files:**
- Modify: `package.json`
- Create: `src/notifications/notifications.module.ts`
- Create: `src/notifications/notifications.consumer.ts`
- Modify: `src/app.module.ts`

- [ ] **Step 1: Install Mailer Packages**

```bash
rtk npm i --save @nestjs-modules/mailer nodemailer
rtk npm i --save-dev @types/nodemailer
```

- [ ] **Step 2: Create Consumer**

```typescript
import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { MailerService } from '@nestjs-modules/mailer';

@Controller()
export class NotificationsConsumer {
  constructor(private readonly mailerService: MailerService) {}

  @EventPattern('application_created')
  async handleApplicationCreated(@Payload() data: any) {
    console.log(`[E-MAIL INFO] Sending application confirmation to user ${data.userId} for job ${data.jobId}`);
    try {
      await this.mailerService.sendMail({
        to: 'candidato_teste@example.com', // Usando e-mail de teste para evitar bounce em ambiente local
        subject: 'Candidatura Recebida - Hubb Vagas',
        text: `Olá! Sua candidatura para a vaga (ID: ${data.jobId}) foi recebida com sucesso.`,
      });
      console.log(`[E-MAIL SENT] Confirmation sent for application ${data.applicationId}`);
    } catch (e) {
      console.error(`[E-MAIL ERROR] Failed to send email for application ${data.applicationId}:`, e);
    }
  }

  @EventPattern('job_closed')
  async handleJobClosed(@Payload() data: any) {
    console.log(`[E-MAIL INFO] Job ${data.jobId} is now closed. Notifying applicants.`);
    try {
      await this.mailerService.sendMail({
        to: 'empresa_teste@example.com',
        subject: 'Vaga Fechada - Hubb Vagas',
        text: `A vaga (ID: ${data.jobId}) foi fechada por contratação do candidato (ID: ${data.hiredAppId}).`,
      });
      console.log(`[E-MAIL SENT] Closure notification sent for job ${data.jobId}`);
    } catch (e) {
      console.error(`[E-MAIL ERROR] Failed to send closure email for job ${data.jobId}:`, e);
    }
  }
}
```

- [ ] **Step 3: Create Module with MailerModule Configuration**

```typescript
import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationsConsumer } from './notifications.consumer';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('SMTP_HOST') || 'smtp.ethereal.email',
          port: configService.get<number>('SMTP_PORT') || 587,
          auth: {
            user: configService.get<string>('SMTP_USER') || 'ethereal_user',
            pass: configService.get<string>('SMTP_PASS') || 'ethereal_pass',
          },
        },
        defaults: {
          from: '"No Reply" <noreply@hubbvagas.com>',
        },
      }),
    }),
  ],
  controllers: [NotificationsConsumer],
})
export class NotificationsModule {}
```

- [ ] **Step 4: Add to AppModule**
Import `NotificationsModule` in the `imports` array of `src/app.module.ts`.

- [ ] **Step 5: Commit**
```bash
rtk git add package.json package-lock.json src/notifications/ src/app.module.ts
rtk git commit -m "feat: implement NotificationsModule with nodemailer"
```

---

### Task 5: Application Approval Endpoint

**Files:**
- Modify: `src/jobs/jobs.module.ts`
- Modify: `src/jobs/jobs.controller.ts`
- Modify: `src/jobs/jobs.service.ts`

- [ ] **Step 1: Update JobsModule to import MessagingModule**

Add `MessagingModule` to `imports` in `src/jobs/jobs.module.ts`.

- [ ] **Step 2: Update JobsService to approve and emit**

Add `approveApplication` in `src/jobs/jobs.service.ts` and inject `RMQ_CLIENT`:

```typescript
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';

// In JobsService class:
  constructor(
    private readonly jobsRepository: JobsRepository,
    private readonly statusHistoryRepository: JobStatusHistoryRepository,
    @Inject('RMQ_CLIENT') private readonly client: ClientProxy,
  ) {}

  async approveApplication(jobId: string, appId: string, companyId: string) {
    const job = await this.findOne(jobId);
    if (job.companyId !== companyId) {
      throw new ForbiddenException('Você não tem permissão para alterar esta vaga');
    }
    
    // Emit approval event
    this.client.emit('application_approved', { jobId, appId, companyId });
    return { message: 'Application approved successfully, processing job closure.' };
  }
```

- [ ] **Step 3: Add endpoint in JobsController**

Add to `src/jobs/jobs.controller.ts`:

```typescript
  @Patch(':jobId/applications/:appId/approve')
  @Roles(Role.Company)
  @UseGuards(JwtAuthGuard, RolesGuard)
  approveApplication(
    @Param('jobId') jobId: string,
    @Param('appId') appId: string,
    @Request() req,
  ) {
    return this.jobsService.approveApplication(jobId, appId, req.user.profileId);
  }
```

- [ ] **Step 4: Commit**
```bash
rtk git add src/jobs/
rtk git commit -m "feat: endpoint to approve application"
```

---

### Task 6: Job Closure Worker

**Files:**
- Create: `src/jobs/job-closure.worker.ts`
- Modify: `src/jobs/jobs.module.ts`

- [ ] **Step 1: Create Worker Controller**

```typescript
import { Controller, Inject } from '@nestjs/common';
import { EventPattern, Payload, ClientProxy } from '@nestjs/microservices';
import { LockService } from '../infra/redis/lock.service';
import { JobsRepository } from '../repositories/jobs.repository';
import { JobStatusHistoryRepository } from '../repositories/jobStatusHistory.repository';
import { PrismaService } from '../infra/prisma/prisma.service';
import { JobStatus } from '../infra/prisma/generated/client';

@Controller()
export class JobClosureWorker {
  constructor(
    private readonly lockService: LockService,
    private readonly jobsRepository: JobsRepository,
    private readonly statusHistoryRepository: JobStatusHistoryRepository,
    private readonly prisma: PrismaService,
    @Inject('RMQ_CLIENT') private readonly client: ClientProxy,
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

- [ ] **Step 2: Add to JobsModule**

Register `JobClosureWorker` in `controllers` array in `src/jobs/jobs.module.ts`.

- [ ] **Step 3: Commit**
```bash
rtk git add src/jobs/
rtk git commit -m "feat: implement job closure worker with redis lock"
```
