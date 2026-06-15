# Job Listing and Applications Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement job listing with filters for candidates, candidacy flow (applications) with validations, and job status history logging.

**Architecture:** Módulos NestJS desacoplados com inversão de dependência através de repositórios abstratos e persistência via Prisma. Validações com Zod e Roles Guard para autenticação.

**Tech Stack:** NestJS, Prisma, PostgreSQL, Zod, Passport JWT.

---

### Task 1: Modificações no Banco de Dados (Schema Prisma e Migrations)

**Files:**

- Modify: `src/infra/prisma/schema.prisma`

- [ ] **Step 1.1: Atualizar o arquivo schema.prisma**
      Modificar o arquivo `src/infra/prisma/schema.prisma` para incluir a tabela `JobStatusHistory` e as devidas relações.

  ```prisma
  // Modificações a fazer em src/infra/prisma/schema.prisma:
  // 1. Adicionar o modelo JobStatusHistory:
  model JobStatusHistory {
    id           String    @id @default(uuid())
    jobId        String
    job          Job       @relation(fields: [jobId], references: [id])
    status       JobStatus
    changedById  String
    changedBy    Account   @relation(fields: [changedById], references: [id])
    reason       String?
    createdAt    DateTime  @default(now())

    @@map("job_status_history")
  }

  // 2. Adicionar statusHistory JobStatusHistory[] ao modelo Job
  // 3. Adicionar jobStatusHistories JobStatusHistory[] ao modelo Account
  ```

- [ ] **Step 1.2: Rodar as migrações locais**
      Executar o comando de migração do Prisma para aplicar as alterações no banco de dados local.
      Run: `rtk npx prisma migrate dev --name add_job_status_history`
      Expected: Migração gerada com sucesso e cliente Prisma atualizado.

- [ ] **Step 1.3: Commit (Aguardar OK expresso do usuário)**
      Aguardar autorização expressa do usuário.
      Run: `git add src/infra/prisma/schema.prisma src/infra/prisma/migrations/`
      Run: `git commit -m "db: adiciona modelo JobStatusHistory ao schema e cria migracao"`

---

### Task 2: Repositório de Histórico de Status de Vagas

**Files:**

- Create: `src/repositories/job-status-history.repository.ts`
- Create: `src/infra/prisma/prisma-repository/prisma-job-status-history.repository.ts`
- Modify: `src/infra/prisma/prisma.module.ts`

- [ ] **Step 2.1: Criar a interface abstrata do repositório**
      Criar o arquivo `src/repositories/job-status-history.repository.ts`:

  ```typescript
  import { JobStatus, JobStatusHistory } from '@prisma/client';

  export abstract class JobStatusHistoryRepository {
    abstract create(data: {
      jobId: string;
      status: JobStatus;
      changedById: string;
      reason?: string;
    }): Promise<any>;
  }
  ```

- [ ] **Step 2.2: Implementar o repositório Prisma**
      Criar o arquivo `src/infra/prisma/prisma-repository/prisma-job-status-history.repository.ts`:

  ```typescript
  import { Injectable } from '@nestjs/common';
  import { JobStatusHistoryRepository } from 'src/repositories/job-status-history.repository';
  import { PrismaService } from '../prisma.service';
  import { JobStatus } from '@prisma/client';

  @Injectable()
  export class PrismaJobStatusHistoryRepository implements JobStatusHistoryRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: {
      jobId: string;
      status: JobStatus;
      changedById: string;
      reason?: string;
    }): Promise<any> {
      return this.prisma.jobStatusHistory.create({
        data: {
          jobId: data.jobId,
          status: data.status,
          changedById: data.changedById,
          reason: data.reason,
        },
      });
    }
  }
  ```

- [ ] **Step 2.3: Registrar o repositório no PrismaModule**
      Modificar o arquivo `src/infra/prisma/prisma.module.ts` para prover e exportar o novo repositório.

  ```typescript
  // Adicionar nos providers e exports:
  {
    provide: JobStatusHistoryRepository,
    useClass: PrismaJobStatusHistoryRepository,
  }
  ```

- [ ] **Step 2.4: Commit (Aguardar OK expresso do usuário)**
      Aguardar autorização expressa do usuário.
      Run: `git add src/repositories/job-status-history.repository.ts src/infra/prisma/prisma-repository/prisma-job-status-history.repository.ts src/infra/prisma/prisma.module.ts`
      Run: `git commit -m "feat: implementa e registra repositorio de historico de status"`

---

### Task 3: Atualização do JobsService e JobsRepository para Listagem com Filtros e Histórico

**Files:**

- Modify: `src/repositories/jobs.repository.ts`
- Modify: `src/infra/prisma/prisma-repository/prisma-jobs.repository.ts`
- Modify: `src/jobs/jobs.service.ts`

- [ ] **Step 3.1: Adicionar filtros e paginação no JobsRepository**
      Modificar `src/repositories/jobs.repository.ts` para que `findAll` aceite um objeto de filtros opcional:

  ```typescript
  export abstract class JobsRepository {
    abstract create(data: any): Promise<any>;
    abstract findAll(filters?: {
      location?: string;
      contractType?: string;
      companyId?: string;
      search?: string;
      status?: any; // Para diferenciar o filtro do candidato (apenas PUBLISHED)
    }): Promise<any[]>;
    abstract findById(id: string): Promise<any>;
    abstract update(id: string, data: any): Promise<any>;
    abstract remove(id: string): Promise<void>;
  }
  ```

- [ ] **Step 3.2: Implementar filtros no PrismaJobsRepository**
      Modificar `src/infra/prisma/prisma-repository/prisma-jobs.repository.ts` para aplicar os filtros no query do Prisma:

  ```typescript
  async findAll(filters?: {
    location?: string;
    contractType?: string;
    companyId?: string;
    search?: string;
    status?: any;
  }): Promise<any[]> {
    const where: any = {};

    if (filters) {
      if (filters.status) {
        where.status = filters.status;
      }
      if (filters.location) {
        where.location = { contains: filters.location, mode: 'insensitive' };
      }
      if (filters.contractType) {
        where.contractType = filters.contractType;
      }
      if (filters.companyId) {
        where.companyId = filters.companyId;
      }
      if (filters.search) {
        where.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
        ];
      }
    }

    return this.prisma.job.findMany({ where });
  }
  ```

- [ ] **Step 3.3: Atualizar JobsService para usar filtros e gravar Histórico de Status**
      Modificar `src/jobs/jobs.service.ts` para injetar `JobStatusHistoryRepository`. Gravar histórico inicial em `create()` e transições de status em `update()`:

  ```typescript
  // Injetar JobStatusHistoryRepository no construtor
  constructor(
    private readonly jobsRepository: JobsRepository,
    private readonly statusHistoryRepository: JobStatusHistoryRepository,
  ) {}

  // Em create(data, companyId, accountId: string)
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
      reason: 'Vaga criada como rascunho',
    });

    return job;
  }

  // Em update(id, data, companyId, accountId: string)
  async update(id: string, data: any, companyId: string, accountId: string) {
    const job = await this.findOne(id);
    if (job.companyId !== companyId) {
      throw new ForbiddenException('Você não tem permissão para alterar esta vaga');
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

    return updatedJob;
  }
  ```

  _Nota_: Ajustar o `JobsController` e os testes unitários existentes para passar o `accountId` que vem de `req.user.id` no payload JWT.

- [ ] **Step 3.4: Ajustar o JobsController para passar os parâmetros e query filters**
      Modificar `src/jobs/jobs.controller.ts` para repassar o filtro do candidato (apenas `PUBLISHED` por padrão se a role for `User` ou anônimo).

- [ ] **Step 3.5: Commit (Aguardar OK expresso do usuário)**
      Aguardar autorização expressa do usuário.
      Run: `git add src/repositories/jobs.repository.ts src/infra/prisma/prisma-repository/prisma-jobs.repository.ts src/jobs/jobs.service.ts src/jobs/jobs.controller.ts`
      Run: `git commit -m "feat: adiciona suporte a filtros e gravacao de historico de status de vagas"`

---

### Task 4: Módulo de Candidatura (Applications)

**Files:**

- Create: `src/repositories/applications.repository.ts`
- Create: `src/infra/prisma/prisma-repository/prisma-applications.repository.ts`
- Create: `src/applications/dto/create-application.dto.ts`
- Create: `src/applications/applications.service.ts`
- Create: `src/applications/applications.controller.ts`
- Create: `src/applications/applications.module.ts`
- Modify: `src/app.module.ts`
- Modify: `src/infra/prisma/prisma.module.ts`

- [ ] **Step 4.1: Criar a interface abstrata do repositório**
      Criar o arquivo `src/repositories/applications.repository.ts`:

  ```typescript
  export abstract class ApplicationsRepository {
    abstract create(data: { userId: string; jobId: string }): Promise<any>;
    abstract findByUserAndJob(userId: string; jobId: string): Promise<any>;
  }
  ```

- [ ] **Step 4.2: Implementar o repositório Prisma**
      Criar o arquivo `src/infra/prisma/prisma-repository/prisma-applications.repository.ts`:

  ```typescript
  import { Injectable } from '@nestjs/common';
  import { ApplicationsRepository } from 'src/repositories/applications.repository';
  import { PrismaService } from '../prisma.service';

  @Injectable()
  export class PrismaApplicationsRepository implements ApplicationsRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: { userId: string; jobId: string }): Promise<any> {
      return this.prisma.application.create({
        data: {
          userId: data.userId,
          jobId: data.jobId,
        },
      });
    }

    async findByUserAndJob(userId: string; jobId: string): Promise<any> {
      return this.prisma.application.findFirst({
        where: {
          userId,
          jobId,
        },
      });
    }
  }
  ```

- [ ] **Step 4.3: Registrar no PrismaModule**
      Modificar `src/infra/prisma/prisma.module.ts` para prover e exportar o `ApplicationsRepository`.

- [ ] **Step 4.4: Criar o DTO de Candidatura**
      Criar o arquivo `src/applications/dto/create-application.dto.ts`:

  ```typescript
  import { z } from 'zod';

  export const createApplicationSchema = z.object({
    jobId: z.string().uuid(),
  });

  export type CreateApplicationDto = z.infer<typeof createApplicationSchema>;
  ```

- [ ] **Step 4.5: Criar o ApplicationsService**
      Criar o arquivo `src/applications/applications.service.ts` aplicando as validações necessárias:

  ```typescript
  import {
    Injectable,
    NotFoundException,
    BadRequestException,
  } from '@nestjs/common';
  import { ApplicationsRepository } from '../repositories/applications.repository';
  import { JobsRepository } from '../repositories/jobs.repository';
  import { UsersRepository } from '../repositories/users.repository';
  import { JobStatus } from '@prisma/client';

  @Injectable()
  export class ApplicationsService {
    constructor(
      private readonly applicationsRepository: ApplicationsRepository,
      private readonly jobsRepository: JobsRepository,
      private readonly usersRepository: UsersRepository,
    ) {}

    async apply(jobId: string, accountId: string) {
      const job = await this.jobsRepository.findById(jobId);
      if (!job) {
        throw new NotFoundException('Vaga não encontrada');
      }

      if (job.status !== JobStatus.PUBLISHED) {
        throw new BadRequestException(
          'Não é possível candidatar-se a uma vaga que não está publicada',
        );
      }

      // Buscar o perfil do User a partir da accountId
      // Obs: dependendo de como as tabelas foram modeladas, precisamos obter o userId associado ao accountId
      const user = await this.usersRepository.findByAccountId(accountId); // Ajustar método caso necessário
      if (!user) {
        throw new BadRequestException(
          'Usuário não possui perfil de candidato ativo',
        );
      }

      const existingApplication =
        await this.applicationsRepository.findByUserAndJob(user.id, jobId);
      if (existingApplication) {
        throw new BadRequestException('Você já se candidatou a esta vaga');
      }

      return this.applicationsRepository.create({
        userId: user.id,
        jobId,
      });
    }
  }
  ```

- [ ] **Step 4.6: Criar o ApplicationsController**
      Criar o arquivo `src/applications/applications.controller.ts` protegendo o endpoint com `JwtAuthGuard` e `RolesGuard` (apenas `User`):

  ```typescript
  import {
    Controller,
    Post,
    Body,
    UseGuards,
    Request,
    UsePipes,
  } from '@nestjs/common';
  import { JwtAuthGuard } from '../guards/jwt-auth.guard';
  import { RolesGuard } from '../guards/roles.guard';
  import { Roles } from '../decorators/roles.decorator';
  import { Role } from '../decorators/role.enum';
  import { ZodValidationPipe } from '../infra/pipes/zod-validation.pipe';
  import { ApplicationsService } from './applications.service';
  import {
    CreateApplicationDto,
    createApplicationSchema,
  } from './dto/create-application.dto';

  @Controller('applications')
  export class ApplicationsController {
    constructor(private readonly applicationsService: ApplicationsService) {}

    @Post()
    @Roles(Role.User)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @UsePipes(new ZodValidationPipe(createApplicationSchema))
    create(@Body() dto: CreateApplicationDto, @Request() req) {
      return this.applicationsService.apply(dto.jobId, req.user.id);
    }
  }
  ```

- [ ] **Step 4.7: Criar e registrar o ApplicationsModule**
      Criar o arquivo `src/applications/applications.module.ts` e importá-lo no `src/app.module.ts`.

- [ ] **Step 4.8: Commit (Aguardar OK expresso do usuário)**
      Aguardar autorização expressa do usuário.
      Run: `git add src/applications/ src/repositories/applications.repository.ts src/infra/prisma/prisma-repository/prisma-applications.repository.ts src/app.module.ts`
      Run: `git commit -m "feat: implementa modulo de candidatura com validacoes e autorizacao"`

---

### Task 5: Testes Unitários e Validação Geral

**Files:**

- Modify: `src/jobs/jobs.service.spec.ts`
- Create: `src/applications/applications.service.spec.ts`

- [ ] **Step 5.1: Escrever testes unitários para a candidatura**
      Criar o arquivo `src/applications/applications.service.spec.ts` cobrindo os cenários de erro e sucesso no fluxo de candidatura.

- [ ] **Step 5.2: Ajustar/Criar testes para a listagem de vagas com filtros e histórico de status**
      Atualizar os testes unitários do `JobsService` em `src/jobs/jobs.service.spec.ts`.

- [ ] **Step 5.3: Executar a suite de testes**
      Run: `rtk npm run test`
      Expected: Todos os testes passando com sucesso.

- [ ] **Step 5.4: Rodar o linter**
      Run: `rtk npm run lint`
      Expected: Nenhum erro de linter no código.

- [ ] **Step 5.5: Rodar a compilação (build)**
      Run: `rtk npm run build`
      Expected: Build compilado com sucesso sem erros.

- [ ] **Step 5.6: Commit Final (Aguardar OK expresso do usuário)**
      Aguardar autorização expressa do usuário.
      Run: `git add src/jobs/jobs.service.spec.ts src/applications/applications.service.spec.ts`
      Run: `git commit -m "test: adiciona testes unitarios para candidaturas e listagem de vagas"`
