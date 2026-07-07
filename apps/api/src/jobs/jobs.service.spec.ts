import { Test, TestingModule } from '@nestjs/testing';
import { JobsService } from './jobs.service';
import { JobsRepository } from '../repositories/jobs.repository';
import { JobStatusHistoryRepository } from '../repositories/jobStatusHistory.repository';
import { JobStatus } from '../infra/prisma/generated/client';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('JobsService', () => {
  let service: JobsService;
  let repository: jest.Mocked<JobsRepository>;
  let statusHistoryRepository: jest.Mocked<JobStatusHistoryRepository>;

  const mockJob = {
    id: 'job-1',
    title: 'Test Job',
    description: 'Description',
    requirements: 'Requirements',
    location: 'Remote',
    contractType: 'CLT',
    expiresAt: new Date(),
    status: JobStatus.DRAFT,
    companyId: 'company-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        {
          provide: JobsRepository,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: JobStatusHistoryRepository,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: 'RMQ_CLIENT',
          useValue: {
            emit: jest.fn(),
          },
        },
        {
          provide: 'REDIS_CLIENT',
          useValue: {
            get: jest.fn(),
            setex: jest.fn(),
            del: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
    repository = module.get(JobsRepository);
    statusHistoryRepository = module.get(JobStatusHistoryRepository);
  });

  it('should create a job with DRAFT status and log status history', async () => {
    repository.create.mockResolvedValue(mockJob);
    statusHistoryRepository.create.mockResolvedValue(null as any);
    const data = {
      title: 'Test Job',
      description: 'Description',
      requirements: 'Requirements',
      location: 'Remote',
      contractType: 'CLT',
      expiresAt: new Date().toISOString(),
    };

    await service.create(data, 'company-1', 'account-1');

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        ...data,
        companyId: 'company-1',
        status: JobStatus.DRAFT,
      }),
    );
    expect(statusHistoryRepository.create).toHaveBeenCalledWith({
      jobId: 'job-1',
      status: JobStatus.DRAFT,
      changedById: 'account-1',
      reason: 'Status inicial como DRAFT',
    });
  });

  it('should throw NotFoundException if job not found on update', async () => {
    repository.findById.mockResolvedValue(null);
    await expect(
      service.update('job-1', {}, 'company-1', 'account-1'),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException if company does not own the job on update and not admin', async () => {
    repository.findById.mockResolvedValue(mockJob);
    await expect(
      service.update('job-1', {}, 'company-2', 'account-1'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should update job if user is admin even if not owner', async () => {
    repository.findById.mockResolvedValue(mockJob);
    repository.update.mockResolvedValue({ ...mockJob, title: 'Updated Admin' });

    const result = await service.update(
      'job-1',
      { title: 'Updated Admin' },
      'company-2', // not the owner
      'account-1',
      true, // isAdmin
    );
    expect(repository.update).toHaveBeenCalledWith('job-1', {
      title: 'Updated Admin',
    });
    expect(result.title).toBe('Updated Admin');
  });

  it('should update job if company owns it', async () => {
    repository.findById.mockResolvedValue(mockJob);
    repository.update.mockResolvedValue({ ...mockJob, title: 'Updated' });

    const result = await service.update(
      'job-1',
      { title: 'Updated' },
      'company-1',
      'account-1',
    );
    expect(repository.update).toHaveBeenCalledWith('job-1', {
      title: 'Updated',
    });
    expect(result.title).toBe('Updated');
  });

  it('should log status transition if status changes on update', async () => {
    repository.findById.mockResolvedValue(mockJob);
    repository.update.mockResolvedValue({
      ...mockJob,
      status: JobStatus.PUBLISHED,
    });
    statusHistoryRepository.create.mockResolvedValue(null as any);

    await service.update(
      'job-1',
      { status: JobStatus.PUBLISHED },
      'company-1',
      'account-1',
    );

    expect(statusHistoryRepository.create).toHaveBeenCalledWith({
      jobId: 'job-1',
      status: JobStatus.PUBLISHED,
      changedById: 'account-1',
      reason: 'Alteração de status via PATCH',
    });
  });

  it('should throw ForbiddenException if company does not own the job on remove and not admin', async () => {
    repository.findById.mockResolvedValue(mockJob);
    await expect(service.remove('job-1', 'company-2')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should remove job if user is admin even if not owner', async () => {
    repository.findById.mockResolvedValue(mockJob);
    repository.remove.mockResolvedValue(undefined);

    await service.remove('job-1', 'company-2', true);
    expect(repository.remove).toHaveBeenCalledWith('job-1');
  });

  it('should remove job if company owns it', async () => {
    repository.findById.mockResolvedValue(mockJob);
    repository.remove.mockResolvedValue(undefined);

    await service.remove('job-1', 'company-1');
    expect(repository.remove).toHaveBeenCalledWith('job-1');
  });
});
