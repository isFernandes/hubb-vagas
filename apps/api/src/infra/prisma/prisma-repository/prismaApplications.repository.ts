import { Injectable } from '@nestjs/common';
import { ApplicationsRepository } from 'src/repositories/applications.repository';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaApplicationsRepository implements ApplicationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { userId: string; jobId: string }): Promise<any> {
    return this.prisma.$transaction(async (tx) => {
      const application = await tx.application.create({
        data: {
          userId: data.userId,
          jobId: data.jobId,
        },
      });

      await tx.userApplications.create({
        data: {
          userId: data.userId,
          applicationId: application.id,
        },
      });

      return application;
    });
  }

  async findByUserAndJob(userId: string, jobId: string): Promise<any> {
    return this.prisma.application.findFirst({
      where: {
        userId,
        jobId,
      },
    });
  }
}
