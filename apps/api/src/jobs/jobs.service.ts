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
import { Redis } from 'ioredis';

@Injectable()
export class JobsService {
  constructor(
    private readonly jobsRepository: JobsRepository,
    private readonly statusHistoryRepository: JobStatusHistoryRepository,
    @Inject('RMQ_CLIENT') private readonly client: ClientProxy,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  private async invalidateListCaches() {
    try {
      const keys = await this.redis.keys('job:list:*');
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (e) {
      console.error('[Redis Error] Failed to invalidate job lists cache', e);
    }
  }

  async create(data: any, companyId: string, accountId: string) {
    const job = await this.jobsRepository.create({
      ...data,
      companyId,
      status: JobStatus.PUBLISHED,
    });

    await this.statusHistoryRepository.create({
      jobId: job.id,
      status: JobStatus.PUBLISHED,
      changedById: accountId,
      reason: 'Status inicial como PUBLISHED (Criação direta)',
    });

    await this.invalidateListCaches();

    return job;
  }

  async findAll(filters?: {
    location?: string;
    contractType?: string;
    companyId?: string;
    search?: string;
    status?: any;
  }) {
    const filterString = filters ? JSON.stringify(filters) : '{}';
    const filtersHash = Buffer.from(filterString).toString('base64');
    const cacheKey = `job:list:${filtersHash}`;

    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.error(`[Redis Error] Failed to get cache for ${cacheKey}`, e);
    }

    const data = await this.jobsRepository.findAll(filters);

    try {
      await this.redis.setex(cacheKey, 180, JSON.stringify(data)); // 3 minutes TTL
    } catch (e) {
      console.error(`[Redis Error] Failed to set cache for ${cacheKey}`, e);
    }

    return data;
  }

  async findOne(id: string) {
    const cacheKey = `job:detail:${id}`;

    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.error(`[Redis Error] Failed to get cache for ${cacheKey}`, e);
    }

    const job = await this.jobsRepository.findById(id);
    if (!job) {
      throw new NotFoundException('Vaga não encontrada');
    }

    try {
      await this.redis.setex(cacheKey, 3600, JSON.stringify(job)); // 1 hour TTL
    } catch (e) {
      console.error(`[Redis Error] Failed to set cache for ${cacheKey}`, e);
    }

    return job;
  }

  async update(
    id: string,
    data: any,
    companyId: string,
    accountId: string,
    isAdmin = false,
  ) {
    const job = await this.findOne(id);

    if (job.companyId !== companyId && !isAdmin) {
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

    // Invalidate Caches
    try {
      await this.redis.del(`job:detail:${id}`);
      await this.invalidateListCaches();
    } catch (e) {
      console.error(
        `[Redis Error] Failed to invalidate cache for job:detail:${id}`,
        e,
      );
    }

    return updatedJob;
  }

  async remove(id: string, companyId: string, isAdmin = false) {
    const job = await this.findOne(id);

    if (job.companyId !== companyId && !isAdmin) {
      throw new ForbiddenException(
        'Você não tem permissão para excluir esta vaga',
      );
    }

    const result = await this.jobsRepository.remove(id);

    // Invalidate Caches
    try {
      await this.redis.del(`job:detail:${id}`);
      await this.invalidateListCaches();
    } catch (e) {
      console.error(
        `[Redis Error] Failed to invalidate cache for job:detail:${id}`,
        e,
      );
    }

    return result;
  }

  async approveApplication(jobId: string, appId: string, companyId: string) {
    const job = await this.findOne(jobId);
    if (job.companyId !== companyId) {
      throw new ForbiddenException(
        'Você não tem permissão para alterar esta vaga',
      );
    }

    this.client.emit('application_approved', { jobId, appId, companyId });
    return {
      message: 'Application approved successfully, processing job closure.',
    };
  }
}
