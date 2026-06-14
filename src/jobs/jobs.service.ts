import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { JobsRepository } from '../repositories/jobs.repository';
import { JobStatus } from '@prisma/client';

@Injectable()
export class JobsService {
  constructor(private readonly jobsRepository: JobsRepository) {}

  async create(data: any, companyId: string) {
    return this.jobsRepository.create({
      ...data,
      companyId,
      status: JobStatus.DRAFT,
    });
  }

  async findAll() {
    return this.jobsRepository.findAll();
  }

  async findOne(id: string) {
    const job = await this.jobsRepository.findById(id);
    if (!job) {
      throw new NotFoundException('Vaga não encontrada');
    }
    return job;
  }

  async update(id: string, data: any, companyId: string) {
    const job = await this.findOne(id);

    if (job.companyId !== companyId) {
      throw new ForbiddenException(
        'Você não tem permissão para alterar esta vaga',
      );
    }

    return this.jobsRepository.update(id, data);
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
}
