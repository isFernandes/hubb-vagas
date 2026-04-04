import { Injectable } from '@nestjs/common';
import { JobsRepository } from '../repositories/jobs.repository';

@Injectable()
export class JobsService {
  constructor(private readonly jobsRepository: JobsRepository) {}

  async create(data: any) {
    return this.jobsRepository.create(data);
  }

  async findAll() {
    return this.jobsRepository.findAll();
  }

  async findOne(id: string) {
    return this.jobsRepository.findById(id);
  }

  async update(id: string, data: any) {
    return this.jobsRepository.update(id, data);
  }

  async remove(id: string) {
    return this.jobsRepository.remove(id);
  }
}