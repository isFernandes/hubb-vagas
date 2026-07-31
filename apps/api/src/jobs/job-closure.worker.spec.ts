import { Test, TestingModule } from '@nestjs/testing';
import { JobClosureWorker } from './job-closure.worker';
import { LockService } from '../infra/redis/lock.service';
import { JobsRepository } from '../repositories/jobs.repository';
import { JobStatusHistoryRepository } from '../repositories/jobStatusHistory.repository';
import { PrismaService } from '../infra/prisma/prisma.service';
import { JobStatus } from '../infra/prisma/generated/client';

describe('JobClosureWorker', () => {
  let worker: JobClosureWorker;
  let lockService: jest.Mocked<LockService>;
  let jobsRepository: jest.Mocked<JobsRepository>;
  let statusHistoryRepository: jest.Mocked<JobStatusHistoryRepository>;
  let prisma: any;
  let rmqClient: any;
  let redis: any;

  beforeEach(async () => {
    lockService = {
      acquireLock: jest.fn().mockResolvedValue(true),
      releaseLock: jest.fn().mockResolvedValue(true),
    } as any;

    jobsRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    } as any;

    statusHistoryRepository = {
      create: jest.fn(),
    };

    prisma = {
      application: {
        count: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
      },
      job: {
        findUnique: jest.fn(),
      },
      company: {
        findUnique: jest.fn(),
      },
    };

    rmqClient = {
      emit: jest.fn(),
    };

    redis = {
      del: jest.fn(),
    };

    worker = new JobClosureWorker(
      lockService,
      jobsRepository,
      statusHistoryRepository,
      prisma,
      rmqClient,
      redis,
    );
  });

  it('should keep job PUBLISHED if positionsAvailable is 2 and only 1 is approved', async () => {
    jobsRepository.findById.mockResolvedValue({
      id: 'job-1',
      status: JobStatus.PUBLISHED,
      positionsAvailable: 2,
    } as any);

    prisma.application.count.mockResolvedValue(0);

    await worker.handleApplicationApproved({
      jobId: 'job-1',
      appId: 'app-1',
      companyId: 'company-1',
    });

    expect(jobsRepository.update).not.toHaveBeenCalledWith('job-1', {
      status: JobStatus.CLOSED_HIRED,
    });

    expect(prisma.application.update).toHaveBeenCalledWith({
      where: { id: 'app-1' },
      data: { status: 'APPROVED' },
    });
  });
});
