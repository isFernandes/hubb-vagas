import { Controller, Inject } from '@nestjs/common';
import { EventPattern, Payload, ClientProxy } from '@nestjs/microservices';
import { LockService } from '../infra/redis/lock.service';
import { JobsRepository } from '../repositories/jobs.repository';
import { JobStatusHistoryRepository } from '../repositories/jobStatusHistory.repository';
import { PrismaService } from '../infra/prisma/prisma.service';
import { hasTimeConflict } from '../utils/time-conflict.util';
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
        const targetApp = await this.prisma.application.findUnique({
          where: { id: appId },
        });

        if (!targetApp) {
          console.log(`[JobClosureWorker] Application ${appId} not found.`);
          return;
        }

        // Check if candidate already has an overlapping APPROVED application
        if (job.executionDate && job.durationHours) {
          const targetStart = job.executionDate.getTime();
          const targetEnd = targetStart + job.durationHours * 60 * 60 * 1000;

          const overlappingApps = await this.prisma.application.findMany({
            where: {
              userId: targetApp.userId,
              status: 'APPROVED',
              id: { not: appId },
              job: {
                executionDate: { not: null },
                durationHours: { not: null },
              },
            },
            include: { job: true },
          });

          let hasConflict = false;
          for (const app of overlappingApps) {
            if (!app.job.executionDate || !app.job.durationHours) continue;
            const appStart = app.job.executionDate.getTime();
            const appEnd = appStart + app.job.durationHours * 60 * 60 * 1000;

            if (hasTimeConflict(targetStart, targetEnd, appStart, appEnd)) {
              hasConflict = true;
              break;
            }
          }

          if (hasConflict) {
            await this.prisma.application.update({
              where: { id: appId },
              data: { status: 'REJECTED' },
            });
            console.log(`[JobClosureWorker] Application ${appId} was rejected due to an overlapping APPROVED job.`);
            return;
          }
        }

        const approvedCount = await this.prisma.application.count({
          where: { jobId, status: 'APPROVED' },
        });

        const isFullyStaffed = approvedCount + 1 >= job.positionsAvailable;

        if (isFullyStaffed) {
          // Update Job Status
          await this.jobsRepository.update(jobId, {
            status: JobStatus.CLOSED_HIRED,
          });

          // Update Applications (APPROVE the selected one)
          await this.prisma.application.update({
            where: { id: appId },
            data: { status: 'APPROVED' },
          });

          // Fetch applications that will be rejected/standby to emit events
          const appsToReject = await this.prisma.application.findMany({
            where: {
              jobId,
              id: { not: appId },
              status: { in: ['APPLIED', 'SCREENING'] },
            },
            include: { user: { include: { account: true } } },
          });

          const nextStatus = job.enableStandby ? 'STANDBY' : 'REJECTED';

          await this.prisma.application.updateMany({
            where: {
              jobId,
              id: { not: appId },
              status: { in: ['APPLIED', 'SCREENING'] },
            },
            data: { status: nextStatus },
          });

          if (!job.enableStandby) {
            const jobWithCompany = await this.prisma.job.findUnique({
              where: { id: jobId },
              include: { company: true },
            });

            if (jobWithCompany) {
              for (const app of appsToReject) {
                this.client.emit('application_rejected', {
                  email: app.user.account.email,
                  jobTitle: jobWithCompany.title,
                  companyName: jobWithCompany.company.name,
                });
              }
            }
          }

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
        } else {
          // Just approve this one, job remains PUBLISHED
          await this.prisma.application.update({
            where: { id: appId },
            data: { status: 'APPROVED' },
          });
          console.log(`[JobClosureWorker] Application ${appId} approved. Job ${jobId} remains PUBLISHED.`);
        }

        // --- Task 3: Automatic rejection of overlapping pending gigs ---
        if (job.executionDate && job.durationHours) {
          if (targetApp) {
            const targetStart = job.executionDate.getTime();
            const targetEnd = targetStart + job.durationHours * 60 * 60 * 1000;

            const otherPendingApps = await this.prisma.application.findMany({
              where: {
                userId: targetApp.userId,
                id: { not: appId },
                status: { in: ['APPLIED', 'SCREENING'] },
                job: {
                  executionDate: { not: null },
                  durationHours: { not: null },
                },
              },
              include: { job: true, user: { include: { account: true } } },
            });

            const appsToCancel = [];
            for (const app of otherPendingApps) {
              if (!app.job.executionDate || !app.job.durationHours) continue;
              const appStart = app.job.executionDate.getTime();
              const appEnd = appStart + app.job.durationHours * 60 * 60 * 1000;

              if (hasTimeConflict(targetStart, targetEnd, appStart, appEnd)) {
                appsToCancel.push(app);
              }
            }

            if (appsToCancel.length > 0) {
              await this.prisma.application.updateMany({
                where: { id: { in: appsToCancel.map((a) => a.id) } },
                data: { status: 'REJECTED' },
              });
              
              for (const app of appsToCancel) {
                this.client.emit('application_rejected', {
                  email: app.user.account.email,
                  jobTitle: app.job.title,
                  companyName: 'Bico conflitante (Cancelado)',
                });
                console.log(`[JobClosureWorker] Overlapping application ${app.id} for job ${app.jobId} was rejected automatically.`);
              }
            }
          }
        }
        // -------------------------------------------------------------

      }
    } catch (e) {
      console.error(`[JobClosureWorker] Error closing job ${jobId}:`, e);
    } finally {
      await this.lockService.releaseLock(lockKey);
    }
  }
}
