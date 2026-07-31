import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReportsService } from './reports.service';
import { PrismaService } from '../infra/prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { ReportType } from '../infra/prisma/generated/client';

describe('ReportsService', () => {
  let service: ReportsService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      report: {
        create: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
      },
      application: {
        findFirst: vi.fn(),
      },
    };
    service = new ReportsService(prisma);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw BadRequestException if candidate was not approved for the job when reporting NO_SHOW', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-id',
      account_id: 'target-account',
    });
    prisma.application.findFirst.mockResolvedValue(null); // Not found or not approved

    await expect(
      service.createReport(
        'company-account',
        ReportType.NO_SHOW,
        'Candidate did not show up',
        'target-account',
        'job-123',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('should create NO_SHOW report if candidate was approved', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-id',
      account_id: 'target-account',
    });
    prisma.application.findFirst.mockResolvedValue({
      id: 'app-id',
      status: 'APPROVED',
    });
    prisma.report.create.mockResolvedValue({ id: 'report-id' });

    const result = await service.createReport(
      'company-account',
      ReportType.NO_SHOW,
      'Candidate did not show up',
      'target-account',
      'job-123',
    );

    expect(result).toEqual({ id: 'report-id' });
  });
});
