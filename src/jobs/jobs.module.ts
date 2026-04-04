import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsRepository } from 'src/repositories/jobs.repository';
import { PrismaJobsRepository } from '../infra/prisma/prisma-repository/prisma-jobs.repository';

@Module({
  imports: [],
  providers: [
    JobsService,
    { provide: JobsRepository, useClass: PrismaJobsRepository },
  ],
  exports: [JobsService],
})
export class JobsModule {}