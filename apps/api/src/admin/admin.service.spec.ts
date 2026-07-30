import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminService } from './admin.service';

describe('AdminService', () => {
  let service: AdminService;
  let prisma: any;
  let redis: any;
  let rmqClient: any;
  let standbyPromotionService: any;

  beforeEach(() => {
    prisma = {
      report: {
        findUnique: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
      },
      application: {
        findFirst: vi.fn(),
      },
      review: {
        upsert: vi.fn(),
      },
      account: {
        update: vi.fn(),
      },
      accountAuditLog: {
        create: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
      },
      $transaction: vi.fn(async (callback) => {
        return await callback(prisma);
      }),
    };
    redis = {
      get: vi.fn(),
      setex: vi.fn(),
    };
    rmqClient = {
      emit: vi.fn(),
    };
    standbyPromotionService = {
      promoteNextStandby: vi.fn(),
    };
    service = new AdminService(prisma, redis, rmqClient, standbyPromotionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create 1-star penalty review for user application when NO_SHOW report is resolved', async () => {
    prisma.report.findUnique.mockResolvedValue({
      id: 'report-123',
      type: 'NO_SHOW',
      reportedAccountId: 'account-1',
      reportedJobId: 'job-1',
    });

    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      account: { status: 'ACTIVE' }
    });

    prisma.application.findFirst.mockResolvedValue({
      id: 'app-1',
      userId: 'user-1',
      jobId: 'job-1'
    });

    prisma.report.update.mockResolvedValue({ status: 'RESOLVED' });
    prisma.report.count.mockResolvedValue(1);

    await service.resolveReport('report-123', 'RESOLVED', 'Valid', 'admin-1');

    expect(prisma.review.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        applicationId_direction: {
          applicationId: 'app-1',
          direction: 'COMPANY_TO_USER',
        }
      },
      update: expect.objectContaining({ rating: 1 }),
      create: expect.objectContaining({ rating: 1 }),
    }));
    expect(rmqClient.emit).toHaveBeenCalledWith('review_created', { applicationId: 'app-1', direction: 'COMPANY_TO_USER' });
    expect(standbyPromotionService.promoteNextStandby).toHaveBeenCalledWith('job-1');
  });
});
