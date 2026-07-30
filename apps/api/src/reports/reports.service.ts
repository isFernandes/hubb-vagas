import { Injectable, BadRequestException } from '@nestjs/common';
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
    if (type === ReportType.NO_SHOW) {
      if (!reportedAccountId || !reportedJobId) {
        throw new BadRequestException('Reporte de NO_SHOW requer candidato e vaga identificados.');
      }

      const user = await this.prisma.user.findUnique({
        where: { account_id: reportedAccountId },
      });

      if (!user) {
        throw new BadRequestException('Candidato não encontrado.');
      }

      const application = await this.prisma.application.findFirst({
        where: {
          userId: user.id,
          jobId: reportedJobId,
        },
      });

      if (!application || application.status !== 'APPROVED') {
        throw new BadRequestException('Este candidato não foi contratado para esta vaga.');
      }
    }

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
