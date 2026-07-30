# Fix 500 Errors via Zod and Cascading Writes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement strict validation via Zod and refactor creation workflows to use Prisma nested writes, preventing 500 Internal Server Errors due to missing relation data.

**Architecture:** Use `nestjs-zod` to validate incoming requests at the Controller level. Pass the validated payload to Repositories/Services which construct nested Prisma queries (creating `Account` + `Profile` atomically).

**Tech Stack:** NestJS, Zod, Prisma, TypeScript.

## Global Constraints

- Commands must be run inside `apps/api` (the backend workspace) where applicable.
- The endpoints targeted are `POST /accounts`, `POST /users`, `POST /companies`, and their respective PATCH updates.

---

### Task 1: Install Zod Dependencies and Configure Pipe

**Files:**
- Modify: `apps/api/package.json`
- Modify: `apps/api/src/main.ts`

**Interfaces:**
- Produces: Global validation setup allowing controllers to use `@ZodValidationPipe` globally or per controller.

- [ ] **Step 1: Install dependencies**

```bash
cd apps/api && npm install zod nestjs-zod
```

- [ ] **Step 2: Add global Zod Validation Pipe to main.ts**

Modify `apps/api/src/main.ts` to register the global Zod pipe.

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ZodValidationPipe } from 'nestjs-zod';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Add global pipe
  app.useGlobalPipes(new ZodValidationPipe());
  
  await app.listen(3000);
}
bootstrap();
```

- [ ] **Step 3: Commit**

```bash
git add apps/api/package.json apps/api/package-lock.json apps/api/src/main.ts
git commit -m "chore: add zod dependencies and global validation pipe"
```

### Task 2: Create Zod DTOs for User and Company Creation

**Files:**
- Create: `apps/api/src/domain/dtos/create-account.dto.ts`

**Interfaces:**
- Produces: `CreateUserDto`, `CreateCompanyDto` (classes extending createZodDto)

- [ ] **Step 1: Write DTO definitions**

Create `apps/api/src/domain/dtos/create-account.dto.ts`:

```typescript
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  cpf: z.string().length(11),
  bio: z.string().optional(),
});

export class CreateUserDto extends createZodDto(CreateUserSchema) {}

const CreateCompanySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  cnpj: z.string().length(14),
  contact: z.string().optional(),
});

export class CreateCompanyDto extends createZodDto(CreateCompanySchema) {}
```

- [ ] **Step 2: Commit**

```bash
git add apps/api/src/domain/dtos/create-account.dto.ts
git commit -m "feat: define zod dtos for user and company registration"
```

### Task 3: Refactor Account and Profile Creation with Cascading Writes

**Files:**
- Modify: `apps/api/src/infra/prisma/prisma-repository/prismaAccounts.repository.ts` (if it handles creation) or `apps/api/src/application/services/accounts.service.ts`

**Interfaces:**
- Consumes: The validated `CreateUserDto` or `CreateCompanyDto`.
- Produces: A single atomic Prisma query that creates the Account and nested Profile.

- [ ] **Step 1: Update AccountsRepository to accept cascading inputs**

Modify `apps/api/src/infra/prisma/prisma-repository/prismaAccounts.repository.ts` to implement atomic creation for a USER.

*(Assuming `accounts.service.ts` calls `prisma.account.create`)*

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaAccountsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createUserAccount(data: any): Promise<any> {
    return this.prisma.account.create({
      data: {
        email: data.email,
        password: data.password, // Remember this should be hashed in the service
        role: 'USER',
        user: {
          create: {
            name: data.name,
            cpf: data.cpf,
            bio: data.bio
          }
        }
      }
    });
  }

  async createCompanyAccount(data: any): Promise<any> {
    return this.prisma.account.create({
      data: {
        email: data.email,
        password: data.password,
        role: 'COMPANY',
        company: {
          create: {
            name: data.name,
            cnpj: data.cnpj,
            contact: data.contact
          }
        }
      }
    });
  }
}
```

- [ ] **Step 2: Update AccountsService to hash password and use new repo methods**

Modify `apps/api/src/application/services/accounts.service.ts` (or similar file responsible for registration).

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaAccountsRepository } from '../../infra/prisma/prisma-repository/prismaAccounts.repository';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, CreateCompanyDto } from '../../domain/dtos/create-account.dto';

@Injectable()
export class AccountsService {
  constructor(private accountsRepo: PrismaAccountsRepository) {}

  async registerUser(dto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    return this.accountsRepo.createUserAccount({ ...dto, password: hashedPassword });
  }

  async registerCompany(dto: CreateCompanyDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    return this.accountsRepo.createCompanyAccount({ ...dto, password: hashedPassword });
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/infra/prisma/prisma-repository/prismaAccounts.repository.ts apps/api/src/application/services/accounts.service.ts
git commit -m "refactor: implement cascading writes for accounts and profiles"
```

### Task 4: Connect Controllers to the New Workflow

**Files:**
- Modify: `apps/api/src/presentation/controllers/accounts.controller.ts` (or users/companies controller handling creation)

**Interfaces:**
- Consumes: `CreateUserDto`, `CreateCompanyDto`, and `AccountsService`.

- [ ] **Step 1: Apply DTO to POST route**

If the creation is in `UsersController`, change it to redirect to the new cascading flow, OR expose it via `/accounts/register/user`. Assuming `UsersController` is handling `POST /users`:

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { AccountsService } from '../../application/services/accounts.service';
import { CreateUserDto } from '../../domain/dtos/create-account.dto';

@Controller('users')
export class UsersController {
  constructor(private accountsService: AccountsService) {}

  @Post()
  async register(@Body() dto: CreateUserDto) {
    return this.accountsService.registerUser(dto);
  }
}
```

Do the same for `CompaniesController`:

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { AccountsService } from '../../application/services/accounts.service';
import { CreateCompanyDto } from '../../domain/dtos/create-account.dto';

@Controller('companies')
export class CompaniesController {
  constructor(private accountsService: AccountsService) {}

  @Post()
  async register(@Body() dto: CreateCompanyDto) {
    return this.accountsService.registerCompany(dto);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/api/src/presentation/controllers/users.controller.ts apps/api/src/presentation/controllers/companies.controller.ts
git commit -m "feat: bind controllers to zod DTOs and cascading creation"
```
