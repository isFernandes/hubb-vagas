import { Controller, Inject } from '@nestjs/common';
import { EventPattern, Payload, ClientProxy } from '@nestjs/microservices';
import { LockService } from '../infra/redis/lock.service';
import { JobsRepository } from '../repositories/jobs.repository';
import { JobStatusHistoryRepository } from '../repositories/jobStatusHistory.repository';
import { PrismaService } from '../infra/prisma/prisma.service';
import { JobStatus } from '../infra/prisma/generated/client';
import { Redis } from 'ioredis';

@Controller()
export class JobClosureWorker {
  constructor(
    private readonly lockService: LockService,
    private readonly jobsRepository: JobsRepository,
    private readonly statusHistoryRepository: JobStatusHistoryRepository,
    private readonly prisma: PrismaService,
    @Inject('RMQ_CLIENT') private readonly client: ClientProxy,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  @EventPattern('application_approved')
  async handleApplicationApproved(
    @Payload() data: { jobId: string; appId: string; companyId: string },
  ) {
    const { jobId, appId } = data;
    const lockKey = `job-lock:${jobId}`;

    const acquired = await this.lockService.acquireLock(lockKey, 30);
    if (!acquired) {
      console.log(
        `[JobClosureWorker] Job ${jobId} is already locked. Skipping.`,
      );
      return;
    }

    try {
      const job = await this.jobsRepository.findById(jobId);
      if (job && job.status === JobStatus.PUBLISHED) {
        // Update Job Status
        await this.jobsRepository.update(jobId, {
          status: JobStatus.CLOSED_HIRED,
        });

        // Update Applications (APPROVE the selected one, REJECT others)
        await this.prisma.application.update({
          where: { id: appId },
          data: { status: 'APPROVED' },
        });
        await this.prisma.application.updateMany({
          where: { jobId, id: { not: appId } },
          data: { status: 'REJECTED' },
        });

        // Record history
        const account = await this.prisma.company.findUnique({
          where: { id: data.companyId },
        });
        if (account) {
          await this.statusHistoryRepository.create({
            jobId,
            status: JobStatus.CLOSED_HIRED,
            changedById: account.account_id,
            reason: 'Fechado automaticamente por aprovação de candidato',
          });
        }

        // Emit final event
        this.client.emit('job_closed', { jobId, hiredAppId: appId });

        // Invalidate detail cache
        try {
          await this.redis.del(`job:detail:${jobId}`);
        } catch (e) {
          console.error(
            `[Redis Error] Failed to invalidate cache for job:detail:${jobId}`,
            e,
          );
        }

        console.log(`[JobClosureWorker] Job ${jobId} successfully closed.`);
      }
    } catch (e) {
      console.error(`[JobClosureWorker] Error closing job ${jobId}:`, e);
    } finally {
      await this.lockService.releaseLock(lockKey);
    }
  }
}
