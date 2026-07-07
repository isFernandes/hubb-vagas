import { Injectable } from '@nestjs/common';
import { JobStatusHistoryRepository } from 'src/repositories/jobStatusHistory.repository';
import { PrismaService } from '../prisma.service';
import { JobStatus, JobStatusHistory } from '../generated/client';

@Injectable()
export class PrismaJobStatusHistoryRepository implements JobStatusHistoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    jobId: string;
    status: JobStatus;
    changedById: string;
    reason?: string;
  }): Promise<JobStatusHistory> {
    return this.prisma.jobStatusHistory.create({
      data: {
        jobId: data.jobId,
        status: data.status,
        changedById: data.changedById,
        reason: data.reason,
      },
    });
  }
}
