import { Test, TestingModule } from '@nestjs/testing';
import { JobsService } from './jobs.service';
import { JobsRepository } from '../repositories/jobs.repository';
import { JobStatus } from '@prisma/client';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('JobsService', () => {
  let service: JobsService;
  let repository: jest.Mocked<JobsRepository>;

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
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
    repository = module.get(JobsRepository);
  });

  it('should create a job with DRAFT status', async () => {
    repository.create.mockResolvedValue(mockJob);
    const data = {
      title: 'Test Job',
      description: 'Description',
      requirements: 'Requirements',
      location: 'Remote',
      contractType: 'CLT',
      expiresAt: new Date().toISOString(),
    };

    await service.create(data, 'company-1');

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        ...data,
        companyId: 'company-1',
        status: JobStatus.DRAFT,
      }),
    );
  });

  it('should throw NotFoundException if job not found on update', async () => {
    repository.findById.mockResolvedValue(null);
    await expect(service.update('job-1', {}, 'company-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw ForbiddenException if company does not own the job on update', async () => {
    repository.findById.mockResolvedValue(mockJob);
    await expect(service.update('job-1', {}, 'company-2')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should update job if company owns it', async () => {
    repository.findById.mockResolvedValue(mockJob);
    repository.update.mockResolvedValue({ ...mockJob, title: 'Updated' });

    const result = await service.update(
      'job-1',
      { title: 'Updated' },
      'company-1',
    );
    expect(repository.update).toHaveBeenCalledWith('job-1', {
      title: 'Updated',
    });
    expect(result.title).toBe('Updated');
  });

  it('should throw ForbiddenException if company does not own the job on remove', async () => {
    repository.findById.mockResolvedValue(mockJob);
    await expect(service.remove('job-1', 'company-2')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should remove job if company owns it', async () => {
    repository.findById.mockResolvedValue(mockJob);
    repository.remove.mockResolvedValue(undefined);

    await service.remove('job-1', 'company-1');
    expect(repository.remove).toHaveBeenCalledWith('job-1');
  });
});
