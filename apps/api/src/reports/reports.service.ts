import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infra/prisma/prisma.service';
import { ReportType } from '../infra/prisma/generated/client';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async createReport(
    reporterId: string,
    type: ReportType,
    description: string,
    reportedAccountId?: string,
    reportedJobId?: string,
  ) {
    return this.prisma.report.create({
      data: {
        reporterId,
        type,
        description,
        reportedAccountId,
        reportedJobId,
      },
    });
  }
}
