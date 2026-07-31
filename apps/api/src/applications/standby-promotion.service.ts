import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../infra/prisma/prisma.service';
import { ClientProxy } from '@nestjs/microservices';
import { JobStatus } from '../infra/prisma/generated/client';

@Injectable()
export class StandbyPromotionService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('RMQ_CLIENT') private readonly client: ClientProxy,
  ) {}

  async promoteNextStandby(jobId: string) {
    await this.prisma.job.update({
      where: { id: jobId },
      data: { status: JobStatus.PUBLISHED },
    });

    const nextStandby = await this.prisma.application.findFirst({
      where: { jobId, status: 'STANDBY' },
      orderBy: { createdAt: 'asc' },
      include: {
        job: { include: { company: { include: { account: true } } } },
      },
    });

    if (nextStandby) {
      await this.prisma.application.update({
        where: { id: nextStandby.id },
        data: { status: 'SCREENING' },
      });

      this.client.emit('standby_candidate_promoted_to_screening', {
        companyEmail: nextStandby.job.company.account.email,
        jobId,
        jobTitle: nextStandby.job.title,
        applicationId: nextStandby.id,
      });
    }
  }
}
