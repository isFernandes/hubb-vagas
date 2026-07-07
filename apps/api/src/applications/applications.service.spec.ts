import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsService } from './applications.service';
import { ApplicationsRepository } from '../repositories/applications.repository';
import { JobsRepository } from '../repositories/jobs.repository';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { JobStatus } from '../infra/prisma/generated/client';

describe('ApplicationsService', () => {
  let service: ApplicationsService;
  let applicationsRepository: jest.Mocked<ApplicationsRepository>;
  let jobsRepository: jest.Mocked<JobsRepository>;

  beforeEach(async () => {
    const mockApplicationsRepository = {
      create: jest.fn(),
      findByUserAndJob: jest.fn(),
    };
    const mockJobsRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        {
          provide: ApplicationsRepository,
          useValue: mockApplicationsRepository,
        },
        {
          provide: JobsRepository,
          useValue: mockJobsRepository,
        },
        {
          provide: 'RMQ_CLIENT',
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
    applicationsRepository = module.get(ApplicationsRepository);
    jobsRepository = module.get(JobsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw BadRequestException if userId is not provided', async () => {
    await expect(service.apply('job-1', '')).rejects.toThrow(
      new BadRequestException('Usuário não possui perfil de candidato ativo'),
    );
  });

  it('should throw NotFoundException if job does not exist', async () => {
    jobsRepository.findById.mockResolvedValue(null);

    await expect(service.apply('job-1', 'user-1')).rejects.toThrow(
      new NotFoundException('Vaga não encontrada'),
    );
    expect(jobsRepository.findById).toHaveBeenCalledWith('job-1');
  });

  it('should throw BadRequestException if job is not PUBLISHED', async () => {
    jobsRepository.findById.mockResolvedValue({
      id: 'job-1',
      status: JobStatus.DRAFT,
    });

    await expect(service.apply('job-1', 'user-1')).rejects.toThrow(
      new BadRequestException(
        'Não é possível candidatar-se a uma vaga que não está publicada',
      ),
    );
  });

  it('should throw BadRequestException if candidate already applied to the job', async () => {
    jobsRepository.findById.mockResolvedValue({
      id: 'job-1',
      status: JobStatus.PUBLISHED,
    });
    applicationsRepository.findByUserAndJob.mockResolvedValue({
      id: 'app-1',
    });

    await expect(service.apply('job-1', 'user-1')).rejects.toThrow(
      new BadRequestException('Você já se candidatou a esta vaga'),
    );
    expect(applicationsRepository.findByUserAndJob).toHaveBeenCalledWith(
      'user-1',
      'job-1',
    );
  });

  it('should successfully apply to job and return the application', async () => {
    const mockJob = {
      id: 'job-1',
      status: JobStatus.PUBLISHED,
    };
    const mockApp = {
      id: 'app-1',
      userId: 'user-1',
      jobId: 'job-1',
    };

    jobsRepository.findById.mockResolvedValue(mockJob);
    applicationsRepository.findByUserAndJob.mockResolvedValue(null);
    applicationsRepository.create.mockResolvedValue(mockApp);

    const result = await service.apply('job-1', 'user-1');

    expect(result).toEqual(mockApp);
    expect(applicationsRepository.create).toHaveBeenCalledWith({
      userId: 'user-1',
      jobId: 'job-1',
    });
  });
});
