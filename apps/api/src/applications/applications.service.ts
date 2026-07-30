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

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly applicationsRepository: ApplicationsRepository,
    private readonly jobsRepository: JobsRepository,
    private readonly prisma: PrismaService,
    @Inject('RMQ_CLIENT') private readonly client: ClientProxy,
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

        // Buffer of 1 hour (3600000 ms)
        const startConflict = targetStart < appEnd + 3600000;
        const endConflict = appStart < targetEnd + 3600000;

        if (startConflict && endConflict) {
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

    return application;
  }
}
