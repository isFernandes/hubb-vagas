import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { ApplicationsRepository } from '../repositories/applications.repository';
import { JobsRepository } from '../repositories/jobs.repository';
import { JobStatus } from '../infra/prisma/generated/client';
import { ClientProxy } from '@nestjs/microservices';

import { PrismaService } from '../infra/prisma/prisma.service';
import { hasTimeConflict } from '../utils/time-conflict.util';
import { Redis } from 'ioredis';
import { StandbyPromotionService } from './standby-promotion.service';
import { ForbiddenException } from '@nestjs/common';

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly applicationsRepository: ApplicationsRepository,
    private readonly jobsRepository: JobsRepository,
    private readonly prisma: PrismaService,
    @Inject('RMQ_CLIENT') private readonly client: ClientProxy,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly standbyPromotionService: StandbyPromotionService,
  ) {}

  async apply(jobId: string, userId: string) {
    if (!userId) {
      throw new BadRequestException(
        'Usuário não possui perfil de candidato ativo',
      );
    }

    const job = await this.jobsRepository.findById(jobId);
    if (!job) {
      throw new NotFoundException('Vaga não encontrada');
    }

    if (job.status !== JobStatus.PUBLISHED) {
      throw new BadRequestException(
        'Não é possível candidatar-se a uma vaga que não está publicada',
      );
    }

    const existingApplication =
      await this.applicationsRepository.findByUserAndJob(userId, jobId);
    if (existingApplication) {
      throw new BadRequestException('Você já se candidatou a esta vaga');
    }

    if (job.executionDate && job.durationHours) {
      const targetStart = job.executionDate.getTime();
      const targetEnd = targetStart + job.durationHours * 60 * 60 * 1000;

      const overlappingApps = await this.prisma.application.findMany({
        where: {
          userId,
          status: 'APPROVED',
          job: {
            executionDate: { not: null },
            durationHours: { not: null },
          },
        },
        include: { job: true },
      });

      for (const app of overlappingApps) {
        if (!app.job.executionDate || !app.job.durationHours) continue;
        const appStart = app.job.executionDate.getTime();
        const appEnd = appStart + app.job.durationHours * 60 * 60 * 1000;

        if (hasTimeConflict(targetStart, targetEnd, appStart, appEnd)) {
          throw new BadRequestException(
            'Conflito de agenda: você já possui um bico aprovado neste horário (respeitando o intervalo mínimo de 1 hora).',
          );
        }
      }
    }

    const application = await this.applicationsRepository.create({
      userId,
      jobId,
    });

    this.client.emit('application_created', {
      applicationId: application.id,
      jobId,
      userId,
    });

    try {
      await this.redis.del(`job:detail:${jobId}`);
    } catch (e) {
      console.error(
        `[Redis Error] Failed to invalidate cache for job:detail:${jobId}`,
        e,
      );
    }

    return application;
  }

  async checkConflicts(
    jobId: string,
    userId: string,
  ): Promise<{ hasConflict: boolean; message?: string }> {
    const job = await this.jobsRepository.findById(jobId);
    if (!job || !job.executionDate || !job.durationHours) {
      return { hasConflict: false };
    }

    const targetStart = job.executionDate.getTime();
    const targetEnd = targetStart + job.durationHours * 60 * 60 * 1000;

    const overlappingApps = await this.prisma.application.findMany({
      where: {
        userId,
        status: 'APPROVED',
        job: {
          executionDate: { not: null },
          durationHours: { not: null },
        },
      },
      include: { job: true },
    });

    for (const app of overlappingApps) {
      if (!app.job.executionDate || !app.job.durationHours) continue;
      const appStart = app.job.executionDate.getTime();
      const appEnd = appStart + app.job.durationHours * 60 * 60 * 1000;

      if (hasTimeConflict(targetStart, targetEnd, appStart, appEnd)) {
        return {
          hasConflict: true,
          message:
            'Você já possui um bico aprovado neste horário (respeitando o intervalo mínimo de 1 hora).',
        };
      }
    }

    return { hasConflict: false };
  }

  async getUserApplications(userId: string) {
    return this.prisma.application.findMany({
      where: { userId },
      include: {
        job: {
          include: {
            company: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async cancelApplication(applicationId: string, userId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true, user: true },
    });

    if (!application) {
      throw new NotFoundException('Candidatura não encontrada');
    }

    if (application.userId !== userId) {
      throw new ForbiddenException('Você não tem permissão para cancelar esta candidatura');
    }

    if (application.status === 'CANCELLED' || application.status === 'REJECTED') {
      throw new BadRequestException('Esta candidatura já foi cancelada ou rejeitada');
    }

    const wasApproved = application.status === 'APPROVED';

    // Penalty logic for APPROVED cancellations close to executionDate
    if (wasApproved && application.job.executionDate) {
      const now = Date.now();
      const executionTime = application.job.executionDate.getTime();
      const hoursDiff = (executionTime - now) / (1000 * 60 * 60);

      let penalty = 0;
      if (hoursDiff > 0) {
        if (hoursDiff < 5) {
          penalty = 1.5;
        } else if (hoursDiff < 24) {
          penalty = 1.0;
        }
      }

      if (penalty > 0) {
        const newRating = Math.max(0, application.user.averageRating - penalty);
        await this.prisma.user.update({
          where: { id: userId },
          data: { averageRating: newRating },
        });
      }
    }

    const updated = await this.prisma.application.update({
      where: { id: applicationId },
      data: { status: 'CANCELLED' },
    });

    if (wasApproved) {
      await this.standbyPromotionService.promoteNextStandby(application.jobId);
    }

    this.client.emit('application_cancelled', {
      applicationId,
      jobId: application.jobId,
      userId,
    });

    try {
      await this.redis.del(`job:detail:${application.jobId}`);
    } catch (e) {
      console.error(`[Redis Error] Failed to invalidate cache for job:detail:${application.jobId}`, e);
    }

    return updated;
  }
}
