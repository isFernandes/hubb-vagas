import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { PrismaService } from '../infra/prisma/prisma.service';
import { JobsController } from './jobs.controller';
import { JobsRepository } from 'src/repositories/jobs.repository';
import { PrismaJobsRepository } from '../infra/prisma/prisma-repository/prismaJobs.repository';
import { MessagingModule } from '../infra/messaging/messaging.module';
import { JobClosureWorker } from './job-closure.worker';

@Module({
  imports: [MessagingModule],
  controllers: [JobsController, JobClosureWorker],
  providers: [
    JobsService,
    PrismaService,
    { provide: JobsRepository, useClass: PrismaJobsRepository },
  ],
  exports: [JobsService, JobsRepository],
})
export class JobsModule {}
