# Job Posting Enhancements & User Security Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Phase 12.1-12.4 adding payment amounts to jobs, CPF validation for candidates, CNPJ integration via Brasil API, and automated rejection emails.

**Architecture:** We will update the Prisma schema for `Job` and `User`. Validation logic will live in Zod schemas (CPF) and controllers (CNPJ). The UI will handle input masking (BRL and CPF) but send sanitized/integer values to the backend. Rejection emails will be driven by RabbitMQ events from the `JobClosureWorker`.

**Tech Stack:** NestJS, Prisma, React, Zod, RabbitMQ, Nodemailer, Lucide React, Tailwind.

---

### Task 1: Update Database Schema (Prisma)

**Files:**
- Modify: `apps/api/src/infra/prisma/schema.prisma`

- [ ] **Step 1: Update Prisma models**
Add `paymentAmountCents Int` to `Job` and `cpf String? @unique` to `User`.

```prisma
// Em apps/api/src/infra/prisma/schema.prisma

// No model User
model User {
  id               String             @id @default(uuid())
  name             String
  cpf              String?            @unique
// ...

// No model Job
model Job {
  id                 String             @id @default(uuid())
  title              String
  description        String
  requirements       String
  paymentAmountCents Int
// ...
```

- [ ] **Step 2: Push database changes**
Run: `cd apps/api && npx prisma db push`
Expected: PASS with "Your database is now in sync with your schema."

- [ ] **Step 3: Commit**
```bash
git add apps/api/src/infra/prisma/schema.prisma
git commit -m "chore(db): add paymentAmountCents to Job and cpf to User"
```

### Task 2: Backend - Payment Amount & Zod DTOs

**Files:**
- Modify: `apps/api/src/jobs/dto/create-job.dto.ts`

- [ ] **Step 1: Update Zod validation**
```typescript
import { z } from 'zod';

export const createJobSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(10),
  requirements: z.string().min(10),
  location: z.string().min(3),
  contractType: z.string().min(3),
  expiresAt: z.string().datetime(),
  paymentAmountCents: z.number().int().positive(),
});

export type CreateJobDto = z.infer<typeof createJobSchema>;
```

- [ ] **Step 2: Commit**
```bash
git add apps/api/src/jobs/dto/create-job.dto.ts
git commit -m "feat(api): add paymentAmountCents to create-job schema"
```

### Task 3: Frontend - Payment Amount UI

**Files:**
- Modify: `apps/web/src/pages/company/NewJob.tsx`
- Modify: `apps/web/src/pages/candidate/JobDetailsCandidate.tsx`
- Modify: `apps/web/src/pages/candidate/JobsCandidate.tsx`

- [ ] **Step 1: Add input to NewJob.tsx**
Add local state `paymentAmount` (string). When submitting, convert to cents: `Math.round(parseFloat(paymentAmount.replace(',', '.')) * 100)`.
```tsx
// Inside form in NewJob.tsx
<div>
  <label className="block text-sm font-medium text-slate-300 mb-2">Valor Ofertado (R$)</label>
  <Input 
    name="paymentAmount"
    type="number"
    step="0.01"
    min="0.01"
    placeholder="Ex: 150.00"
    value={formData.paymentAmount || ''}
    onChange={handleChange}
    required
    className="bg-slate-900 border-slate-800 text-white"
  />
</div>
// ...
// On submit payload:
paymentAmountCents: Math.round(parseFloat(formData.paymentAmount as string) * 100)
```

- [ ] **Step 2: Render in JobDetailsCandidate.tsx**
```tsx
// Exibir formatado BRL
const formatCurrency = (cents: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

// No return JSX:
<div className="flex items-center bg-slate-950/50 px-3 py-1.5 rounded-md">
  <span className="font-bold text-emerald-400">
    {formatCurrency(job.paymentAmountCents || 0)}
  </span>
</div>
```

- [ ] **Step 3: Commit**
```bash
git add apps/web/src/pages/
git commit -m "feat(web): handle payment amount input and display"
```

### Task 4: Backend - CPF Math Validation

**Files:**
- Modify: `apps/api/src/accounts/dto/create-account.dto.ts`

- [ ] **Step 1: Create CPF validator**
```typescript
const isValidCPF = (cpf: string) => {
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
  const cpfDigits = cpf.split('').map((el) => +el);
  const rest = (count: number) =>
    ((cpfDigits.slice(0, count - 12).reduce((soma, el, index) => soma + el * (count - index), 0) * 10) % 11) % 10;
  return rest(10) === cpfDigits[9] && rest(11) === cpfDigits[10];
};

export const createAccountSchema = z.object({
  // ... other fields
  role: z.nativeEnum(Role),
  cpf: z.string().optional().superRefine((val, ctx) => {
    if (val && !isValidCPF(val)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'CPF inválido' });
    }
  })
}).superRefine((data, ctx) => {
  if (data.role === Role.User && !data.cpf) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'CPF é obrigatório para Candidatos', path: ['cpf'] });
  }
});
```

- [ ] **Step 2: Commit**
```bash
git add apps/api/src/accounts/dto/create-account.dto.ts
git commit -m "feat(api): add mathematical CPF validation for User accounts"
```

### Task 5: Frontend - CPF Input with Mask

**Files:**
- Modify: `apps/web/src/pages/Register.tsx`

- [ ] **Step 1: Add CPF field for Candidates**
```tsx
// Inside Register.tsx
const [cpf, setCpf] = useState('');

const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  let value = e.target.value.replace(/\D/g, '');
  if (value.length > 11) value = value.slice(0, 11);
  value = value.replace(/(\d{3})(\d)/, '$1.$2');
  value = value.replace(/(\d{3})(\d)/, '$1.$2');
  value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  setCpf(value);
};

// On Submit:
cpf: cpf.replace(/\D/g, '')

// JSX for Role = User:
{role === 'User' && (
  <div className="space-y-2">
    <label className="text-sm font-medium text-slate-300">CPF</label>
    <Input required type="text" placeholder="000.000.000-00" value={cpf} onChange={handleCpfChange} className="..." />
  </div>
)}
```

- [ ] **Step 2: Commit**
```bash
git add apps/web/src/pages/Register.tsx
git commit -m "feat(web): add masked CPF input for candidate registration"
```

### Task 6: Backend - CNPJ Brasil API Validation

**Files:**
- Modify: `apps/api/src/accounts/accounts.controller.ts`

- [ ] **Step 1: Validate CNPJ before creation**
```typescript
import { BadRequestException } from '@nestjs/common';

// Inside AccountsController create method:
if (dto.role === Role.Company && dto.cnpj) {
  const cleanCnpj = dto.cnpj.replace(/[\.\-\/]/g, '');
  try {
    const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
    if (!res.ok) {
      throw new BadRequestException('CNPJ inválido ou inexistente na Receita Federal');
    }
  } catch (error) {
    if (error instanceof BadRequestException) throw error;
    throw new BadRequestException('Falha ao consultar CNPJ. Tente novamente mais tarde.');
  }
}
```

- [ ] **Step 2: Commit**
```bash
git add apps/api/src/accounts/accounts.controller.ts
git commit -m "feat(api): block company registration with invalid CNPJ using Brasil API"
```

### Task 7: Backend - Rejection Emails

**Files:**
- Modify: `apps/api/src/jobs/workers/job-closure.worker.ts`
- Modify: `apps/api/src/notifications/notifications.consumer.ts`

- [ ] **Step 1: Emit application_rejected in JobClosureWorker**
```typescript
// Inside JobClosureWorker handleApplicationApproved after acquiring lock
const job = await this.prisma.job.findUnique({ where: { id: jobId }, include: { company: true } });
// Update other applications
await this.prisma.application.updateMany({
  where: { jobId, id: { not: appId } },
  data: { status: 'REJECTED' }
});

const rejectedApps = await this.prisma.application.findMany({
  where: { jobId, status: 'REJECTED' },
  include: { user: { include: { account: true } } }
});

for (const app of rejectedApps) {
  this.client.emit('application_rejected', {
    email: app.user.account.email,
    jobTitle: job.title,
    companyName: job.company.name
  });
}
```

- [ ] **Step 2: Handle event in NotificationsConsumer**
```typescript
// Inside NotificationsConsumer
@EventPattern('application_rejected')
async handleApplicationRejected(@Payload() data: { email: string, jobTitle: string, companyName: string }) {
  await this.emailService.sendMail({
    to: data.email,
    subject: `Atualização sobre sua candidatura: ${data.jobTitle}`,
    text: `Olá! Infelizmente a vaga "${data.jobTitle}" da empresa ${data.companyName} foi preenchida por outro candidato. Não desanime, novas vagas surgem todos os dias!`,
  });
}
```

- [ ] **Step 3: Commit**
```bash
git add apps/api/src/jobs/workers/job-closure.worker.ts apps/api/src/notifications/notifications.consumer.ts
git commit -m "feat(api): send rejection emails to remaining candidates when job closes"
```
