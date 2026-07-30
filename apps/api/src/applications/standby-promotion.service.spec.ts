import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StandbyPromotionService } from './standby-promotion.service';
import { JobStatus } from '../infra/prisma/generated/client';

describe('StandbyPromotionService', () => {
  let service: StandbyPromotionService;
  let prisma: any;
  let rmqClient: any;

  beforeEach(() => {
    prisma = {
      job: {
        update: vi.fn(),
      },
      application: {
        findFirst: vi.fn(),
        update: vi.fn(),
      }
    };
    rmqClient = {
      emit: vi.fn(),
    };
    service = new StandbyPromotionService(prisma, rmqClient);
  });

  it('should reopen job to PUBLISHED even if no standby candidate exists', async () => {
    prisma.application.findFirst.mockResolvedValue(null);

    await service.promoteNextStandby('job-1');

    expect(prisma.job.update).toHaveBeenCalledWith({
      where: { id: 'job-1' },
      data: { status: JobStatus.PUBLISHED },
    });
    expect(prisma.application.update).not.toHaveBeenCalled();
    expect(rmqClient.emit).not.toHaveBeenCalled();
  });

  it('should promote the oldest standby candidate to SCREENING and emit event', async () => {
    prisma.application.findFirst.mockResolvedValue({
      id: 'app-standby-1',
      jobId: 'job-1',
      status: 'STANDBY',
      job: {
        title: 'Vaga Teste',
        company: {
          account: {
            email: 'company@example.com'
          }
        }
      }
    });

    await service.promoteNextStandby('job-1');

    expect(prisma.job.update).toHaveBeenCalledWith({
      where: { id: 'job-1' },
      data: { status: JobStatus.PUBLISHED },
    });

    expect(prisma.application.findFirst).toHaveBeenCalledWith({
      where: { jobId: 'job-1', status: 'STANDBY' },
      orderBy: { createdAt: 'asc' },
      include: { job: { include: { company: { include: { account: true } } } } },
    });

    expect(prisma.application.update).toHaveBeenCalledWith({
      where: { id: 'app-standby-1' },
      data: { status: 'SCREENING' },
    });

    expect(rmqClient.emit).toHaveBeenCalledWith('standby_candidate_promoted_to_screening', {
      companyEmail: 'company@example.com',
      jobId: 'job-1',
      jobTitle: 'Vaga Teste',
      applicationId: 'app-standby-1',
    });
  });
});
