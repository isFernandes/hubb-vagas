import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ApplicationsRepository } from '../repositories/applications.repository';
import { JobsRepository } from '../repositories/jobs.repository';
import { JobStatus } from '../infra/prisma/generated/client';

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly applicationsRepository: ApplicationsRepository,
    private readonly jobsRepository: JobsRepository,
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

    return this.applicationsRepository.create({ userId, jobId });
  }
}
