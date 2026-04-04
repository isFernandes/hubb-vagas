import { Injectable } from '@nestjs/common';
import { JobsRepository } from 'src/repositories/jobs.repository';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaJobsRepository implements JobsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any): Promise<any> {
    return this.prisma.job.create({ data });
  }

  async findAll(): Promise<any[]> {
    return this.prisma.job.findMany();
  }

  async findById(id: string): Promise<any> {
    return this.prisma.job.findUnique({ where: { id } });
  }

  async update(id: string, data: any): Promise<any> {
    return this.prisma.job.update({ where: { id }, data });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.job.delete({ where: { id } });
  }
}