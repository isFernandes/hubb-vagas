import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../infra/prisma/prisma.service';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let paymentsService: PaymentsService;
  let prismaService: PrismaService;
  let rmqClientEmit: any;

  beforeEach(async () => {
    rmqClientEmit = vi.fn();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: PaymentsService,
          useValue: {
            verifyPayment: vi.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            job: {
              findUnique: vi.fn(),
            },
            globalConfig: {
              findFirst: vi.fn(),
            },
            transaction: {
              upsert: vi.fn(),
            },
          },
        },
        {
          provide: 'RMQ_CLIENT',
          useValue: {
            emit: rmqClientEmit,
          },
        },
      ],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
    paymentsService = module.get<PaymentsService>(PaymentsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handleWebhook', () => {
    it('should emit application_approved event when payment is approved', async () => {
      const webhookBody = {
        type: 'payment',
        data: { id: 'payment-123' },
      };

      vi.spyOn(paymentsService, 'verifyPayment').mockResolvedValue({
        approved: true,
        jobId: 'job-123',
        appId: 'app-456',
      });

      vi.spyOn(prismaService.job, 'findUnique').mockResolvedValue({
        id: 'job-123',
        companyId: 'company-789',
      } as any);

      const result = await controller.handleWebhook(webhookBody);

      expect(paymentsService.verifyPayment).toHaveBeenCalledWith('payment-123');
      expect(prismaService.job.findUnique).toHaveBeenCalledWith({
        where: { id: 'job-123' },
      });
      expect(rmqClientEmit).toHaveBeenCalledWith('application_approved', {
        jobId: 'job-123',
        appId: 'app-456',
        companyId: 'company-789',
      });
      expect(result).toEqual({ received: true });
    });

    it('should create a Transaction entry with correct fee calculations upon webhook approval', async () => {
      const webhookBody = {
        type: 'payment',
        data: { id: 'payment-123' },
      };

      vi.spyOn(paymentsService, 'verifyPayment').mockResolvedValue({
        approved: true,
        jobId: 'job-123',
        appId: 'app-456',
      });

      vi.spyOn(prismaService.job, 'findUnique').mockResolvedValue({
        id: 'job-123',
        companyId: 'company-789',
        paymentAmountCents: 10000,
      } as any);

      vi.spyOn(prismaService.globalConfig, 'findFirst').mockResolvedValue({
        platformFeePercentage: 15.0,
      } as any);

      const result = await controller.handleWebhook(webhookBody);

      expect(prismaService.transaction.upsert).toHaveBeenCalledWith({
        where: { paymentId: 'payment-123' },
        update: {},
        create: {
          jobId: 'job-123',
          applicationId: 'app-456',
          amountCents: 10000,
          feeCents: 1500,
          status: 'APPROVED',
          paymentId: 'payment-123',
        },
      });
    });

    it('should not emit application_approved when payment verification fails', async () => {
      const webhookBody = {
        type: 'payment',
        data: { id: 'payment-123' },
      };

      vi.spyOn(paymentsService, 'verifyPayment').mockResolvedValue(null);

      const result = await controller.handleWebhook(webhookBody);

      expect(paymentsService.verifyPayment).toHaveBeenCalledWith('payment-123');
      expect(rmqClientEmit).not.toHaveBeenCalled();
      expect(result).toEqual({ received: true });
    });

    it('should ignore non-payment webhook events', async () => {
      const webhookBody = {
        type: 'subscription',
        data: { id: 'sub-123' },
      };

      const result = await controller.handleWebhook(webhookBody);

      expect(paymentsService.verifyPayment).not.toHaveBeenCalled();
      expect(rmqClientEmit).not.toHaveBeenCalled();
      expect(result).toEqual({ received: true });
    });
  });
});
