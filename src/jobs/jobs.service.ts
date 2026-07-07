import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { JobsRepository } from '../repositories/jobs.repository';
import { JobStatusHistoryRepository } from '../repositories/jobStatusHistory.repository';
import { JobStatus } from '../infra/prisma/generated/client';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class JobsService {
  constructor(
    private readonly jobsRepository: JobsRepository,
    private readonly statusHistoryRepository: JobStatusHistoryRepository,
    @Inject('RMQ_CLIENT') private readonly client: ClientProxy,
  ) {}

  async create(data: any, companyId: string, accountId: string) {
    const job = await this.jobsRepository.create({
      ...data,
      companyId,
      status: JobStatus.DRAFT,
    });

    await this.statusHistoryRepository.create({
      jobId: job.id,
      status: JobStatus.DRAFT,
      changedById: accountId,
      reason: 'Status inicial como DRAFT',
    });

    return job;
  }

  async findAll(filters?: {
    location?: string;
    contractType?: string;
    companyId?: string;
    search?: string;
    status?: any;
  }) {
    return this.jobsRepository.findAll(filters);
  }

  async findOne(id: string) {
    const job = await this.jobsRepository.findById(id);
    if (!job) {
      throw new NotFoundException('Vaga não encontrada');
    }
    return job;
  }

  async update(id: string, data: any, companyId: string, accountId: string) {
    const job = await this.findOne(id);

    if (job.companyId !== companyId) {
      throw new ForbiddenException(
        'Você não tem permissão para alterar esta vaga',
      );
    }

    const updatedJob = await this.jobsRepository.update(id, data);

    if (data.status && data.status !== job.status) {
      await this.statusHistoryRepository.create({
        jobId: id,
        status: data.status,
        changedById: accountId,
        reason: 'Alteração de status via PATCH',
      });
    }

    return updatedJob;
  }

  async remove(id: string, companyId: string) {
    const job = await this.findOne(id);

    if (job.companyId !== companyId) {
      throw new ForbiddenException(
        'Você não tem permissão para excluir esta vaga',
      );
    }

    return this.jobsRepository.remove(id);
  }

  async approveApplication(jobId: string, appId: string, companyId: string) {
    const job = await this.findOne(jobId);
    if (job.companyId !== companyId) {
      throw new ForbiddenException('Você não tem permissão para alterar esta vaga');
    }
    
    this.client.emit('application_approved', { jobId, appId, companyId });
    return { message: 'Application approved successfully, processing job closure.' };
  }
}
