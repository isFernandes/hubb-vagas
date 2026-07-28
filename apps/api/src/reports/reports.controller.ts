import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ReportType } from '../infra/prisma/generated/client';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  createReport(
    @Request() req: any,
    @Body()
    body: {
      type: ReportType;
      description: string;
      reportedAccountId?: string;
      reportedJobId?: string;
    },
  ) {
    return this.reportsService.createReport(
      req.user.id,
      body.type,
      body.description,
      body.reportedAccountId,
      body.reportedJobId,
    );
  }
}
