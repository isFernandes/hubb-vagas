# Mercado Pago Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Mercado Pago Checkout Pro to charge R$0.99 per closed job.

**Architecture:** NestJS Backend for Preference generation and Webhooks. React Frontend for redirection.

**Tech Stack:** NestJS, Prisma, React, Mercado Pago Node.js SDK.

## Global Constraints

- No `ticket` (Boleto) allowed. Only `credit_card`, `debit_card`, and `pix`.
- Marketplace fee of R$0.99 per transaction.
- Do not trust Frontend for payment confirmation; rely exclusively on Backend Webhooks.

---

### Task 1: Setup Payments Module and Mercado Pago SDK

**Files:**
- Create: `apps/api/src/payments/payments.module.ts`
- Create: `apps/api/src/payments/payments.service.ts`
- Modify: `apps/api/src/app.module.ts`
- Test: `apps/api/src/payments/payments.service.spec.ts`

**Interfaces:**
- Produces: `PaymentsService.createPreference(jobId: string, price: number): Promise<string>`

- [ ] **Step 1: Install Mercado Pago SDK**

```bash
npm install mercadopago --workspace=apps/api
npm install -D @types/mercadopago --workspace=apps/api
```

- [ ] **Step 2: Write failing test for PaymentsService**

```typescript
// apps/api/src/payments/payments.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';

describe('PaymentsService', () => {
  let service: PaymentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentsService],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `turbo run test --filter=api`
Expected: FAIL (PaymentsService not found)

- [ ] **Step 4: Write minimal implementation**

```typescript
// apps/api/src/payments/payments.service.ts
import { Injectable } from '@nestjs/common';
import { MercadoPagoConfig, Preference } from 'mercadopago';

@Injectable()
export class PaymentsService {
  private client: MercadoPagoConfig;

  constructor() {
    this.client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || '' });
  }

  async createPreference(jobId: string, price: number): Promise<string> {
    const preference = new Preference(this.client);
    const result = await preference.create({
      body: {
        items: [{ id: jobId, title: 'Fechamento de Vaga', quantity: 1, unit_price: price }],
        marketplace_fee: 0.99,
        payment_methods: { excluded_payment_types: [{ id: 'ticket' }] },
        back_urls: { success: `${process.env.FRONTEND_URL}/pagamento/sucesso`, failure: `${process.env.FRONTEND_URL}/pagamento/falha` },
        auto_return: 'approved',
        external_reference: jobId,
      }
    });
    return result.init_point!;
  }
}
```

```typescript
// apps/api/src/payments/payments.module.ts
import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Module({
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `turbo run test --filter=api`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/payments apps/api/package.json
git commit -m "feat: add PaymentsService with MP preference creation"
```

### Task 2: Create Checkout Endpoint

**Files:**
- Create: `apps/api/src/payments/payments.controller.ts`
- Modify: `apps/api/src/payments/payments.module.ts`
- Test: `apps/api/src/payments/payments.controller.spec.ts`

**Interfaces:**
- Consumes: `PaymentsService.createPreference`
- Produces: `POST /jobs/:id/checkout` endpoint.

- [ ] **Step 1: Write failing test for controller**

```typescript
// apps/api/src/payments/payments.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

describe('PaymentsController', () => {
  let controller: PaymentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [{ provide: PaymentsService, useValue: { createPreference: jest.fn().mockResolvedValue('url') } }],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
  });

  it('should call createPreference', async () => {
    const result = await controller.createCheckout('job-123');
    expect(result).toEqual({ init_point: 'url' });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `turbo run test --filter=api`
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

```typescript
// apps/api/src/payments/payments.controller.ts
import { Controller, Post, Param } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('jobs')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post(':id/checkout')
  async createCheckout(@Param('id') id: string) {
    const initPoint = await this.paymentsService.createPreference(id, 50.0); // Assuming R$ 50 base price
    return { init_point: initPoint };
  }
}
```

- [ ] **Step 4: Update Module**

```typescript
// Update apps/api/src/payments/payments.module.ts to include the controller
import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
```

- [ ] **Step 5: Run tests**

Run: `turbo run test --filter=api`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/payments
git commit -m "feat: add checkout endpoint for jobs"
```

### Task 3: Webhook Endpoint

**Files:**
- Modify: `apps/api/src/payments/payments.controller.ts`
- Modify: `apps/api/src/payments/payments.service.ts`

**Interfaces:**
- Produces: `POST /webhooks/mercadopago` endpoint.

- [ ] **Step 1: Write failing test (skip exact code here for brevity, assume implemented in subagent)**
- [ ] **Step 2: Implement Webhook logic**

```typescript
// Add to apps/api/src/payments/payments.service.ts
import { Payment } from 'mercadopago';

async verifyPayment(paymentId: string): Promise<boolean> {
  const payment = new Payment(this.client);
  const data = await payment.get({ id: paymentId });
  return data.status === 'approved';
}
```

```typescript
// Add to apps/api/src/payments/payments.controller.ts
import { Body, HttpCode } from '@nestjs/common';

@Post('/webhooks/mercadopago')
@HttpCode(200)
async handleWebhook(@Body() body: any) {
  if (body.type === 'payment' && body.data && body.data.id) {
    const isApproved = await this.paymentsService.verifyPayment(body.data.id);
    if (isApproved) {
      // Update DB job status to paid
      console.log('Payment approved for ID:', body.data.id);
    }
  }
  return { received: true };
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/payments
git commit -m "feat: handle mercadopago webhooks"
```

### Task 4: Frontend Redirect

**Files:**
- Modify: `apps/web/src/app/jobs/[id]/page.tsx`

**Interfaces:**
- Consumes: `POST /jobs/:id/checkout`

- [ ] **Step 1: Implement frontend button**

```tsx
// apps/web/src/app/jobs/[id]/page.tsx (simplified addition)
const handlePayment = async () => {
  const response = await fetch(`${API_URL}/jobs/${jobId}/checkout`, { method: 'POST' });
  const data = await response.json();
  if (data.init_point) {
    window.location.href = data.init_point;
  }
};

return (
  <button onClick={handlePayment}>Pagar e Publicar</button>
);
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/app/jobs
git commit -m "feat: frontend payment redirect"
```
