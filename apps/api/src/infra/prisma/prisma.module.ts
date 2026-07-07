import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { JobStatusHistoryRepository } from 'src/repositories/jobStatusHistory.repository';
import { PrismaJobStatusHistoryRepository } from './prisma-repository/prismaJobStatusHistory.repository';
import { ApplicationsRepository } from 'src/repositories/applications.repository';
import { PrismaApplicationsRepository } from './prisma-repository/prismaApplications.repository';

@Global()
@Module({
  providers: [
    PrismaService,
    {
      provide: JobStatusHistoryRepository,
      useClass: PrismaJobStatusHistoryRepository,
    },
    {
      provide: ApplicationsRepository,
      useClass: PrismaApplicationsRepository,
    },
  ],
  exports: [PrismaService, JobStatusHistoryRepository, ApplicationsRepository],
})
export class PrismaModule {}
