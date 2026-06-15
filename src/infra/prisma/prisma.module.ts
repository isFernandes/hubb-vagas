import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { JobStatusHistoryRepository } from 'src/repositories/jobStatusHistory.repository';
import { PrismaJobStatusHistoryRepository } from './prisma-repository/prismaJobStatusHistory.repository';

@Global()
@Module({
  providers: [
    PrismaService,
    {
      provide: JobStatusHistoryRepository,
      useClass: PrismaJobStatusHistoryRepository,
    },
  ],
  exports: [PrismaService, JobStatusHistoryRepository],
})
export class PrismaModule {}
