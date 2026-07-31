import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { JobsRepository } from '../repositories/jobs.repository';
import { JobStatusHistoryRepository } from '../repositories/jobStatusHistory.repository';
import { JobStatus } from '../infra/prisma/generated/client';
import { ClientProxy } from '@nestjs/microservices';
import { Redis } from 'ioredis';
import { PrismaService } from '../infra/prisma/prisma.service';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class JobsService {
  constructor(
    private readonly jobsRepository: JobsRepository,
    private readonly statusHistoryRepository: JobStatusHistoryRepository,
    @Inject('RMQ_CLIENT') private readonly client: ClientProxy,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly prisma: PrismaService,
    private readonly paymentsService: PaymentsService,
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
    const config = await this.prisma.globalConfig.findFirst();
    const minPrice = config ? config.minimumJobPriceCents : 5000;

    if (data.paymentAmountCents < minPrice) {
      throw new ForbiddenException(
        `O valor mínimo para uma vaga é de R$ ${(minPrice / 100).toFixed(2).replace('.', ',')}`,
      );
    }

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
    latitude?: number;
    longitude?: number;
    radius?: number;
  }) {
    const sortedFilters = filters
      ? Object.keys(filters)
          .sort()
          .reduce((acc: any, key) => {
            acc[key] = (filters as any)[key];
            return acc;
          }, {})
      : {};

    const filterString = JSON.stringify(sortedFilters);
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
      await this.redis.setex(cacheKey, 30, JSON.stringify(data)); // Temporarily 30 seconds
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
      await this.redis.setex(cacheKey, 30, JSON.stringify(job)); // Temporarily 30 seconds
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

    if (data.positionsAvailable !== undefined) {
      const approvedCount = await this.prisma.application.count({
        where: { jobId: id, status: 'APPROVED' },
      });

      if (data.positionsAvailable < approvedCount) {
        throw new BadRequestException(
          'Não é possível reduzir o número de vagas abaixo do total de contratações existentes.',
        );
      }
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

    if (job.status === JobStatus.CLOSED_HIRED) {
      throw new BadRequestException('Esta vaga já está fechada e contratada.');
    }

    const config = await this.prisma.globalConfig.findFirst();
    const minPrice = config ? config.minimumJobPriceCents : 5000;
    const price = job.paymentAmountCents
      ? job.paymentAmountCents / 100
      : minPrice / 100;

    const initPoint = await this.paymentsService.createPreference(
      jobId,
      appId,
      price,
    );

    return {
      checkoutRequired: true,
      init_point: initPoint,
    };
  }
}
