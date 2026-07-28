import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import Redis from 'ioredis';
import { PrismaService } from '../infra/prisma/prisma.service';
import { AccountStatus } from '../infra/prisma/generated';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async getDashboardMetrics() {
    const cacheKey = 'admin:dashboard:metrics';
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    try {
      const [totalUsers, totalCompanies, totalJobs, totalApplications] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.company.count(),
        this.prisma.job.count(),
        this.prisma.application.count(),
      ]);

      const metrics = {
        totalUsers,
        totalCompanies,
        totalJobs,
        totalApplications,
        usersOverTime: [
          { name: 'Week 1', count: 10 },
          { name: 'Week 2', count: 15 },
          { name: 'Week 3', count: 25 },
          { name: 'Week 4', count: 42 }
        ],
        jobsOverTime: [
          { name: 'Week 1', count: 5 },
          { name: 'Week 2', count: 8 },
          { name: 'Week 3', count: 12 },
          { name: 'Week 4', count: 20 }
        ],
      };

      await this.redis.setex(cacheKey, 300, JSON.stringify(metrics)); // 300 seconds = 5 mins
      return metrics;
    } catch (error) {
      return {
        totalUsers: 0,
        totalCompanies: 0,
        totalJobs: 0,
        totalApplications: 0,
        usersOverTime: [],
        jobsOverTime: [],
      };
    }
  }

  async getUsers(page: number, limit: number, search: string) {
    const skip = (page - 1) * limit;
    
    const where = search ? {
      email: { contains: search, mode: 'insensitive' as any },
    } : {};

    const [data, total] = await Promise.all([
      this.prisma.account.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: true,
          company: true,
        },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.account.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async updateUserStatus(id: string, newStatus: AccountStatus, reason: string, adminId: string) {
    const account = await this.prisma.account.findUnique({ where: { id } });
    if (!account) throw new NotFoundException('Account not found');

    const result = await this.prisma.$transaction([
      this.prisma.account.update({
        where: { id },
        data: { status: newStatus },
      }),
      this.prisma.accountAuditLog.create({
        data: {
          accountId: id,
          adminId,
          previousStatus: account.status,
          newStatus,
          reason,
        },
      }),
    ]);

    return result[0];
  }

  async getReports(page: number, limit: number, status: string) {
    const skip = (page - 1) * limit;
    
    const where = status ? { status: status as any } : {};

    const [data, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        skip,
        take: limit,
        include: {
          reporter: { include: { user: true, company: true } },
          reportedAccount: { include: { user: true, company: true } },
          reportedJob: true,
          resolvedBy: { include: { user: true, company: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.report.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async resolveReport(id: string, status: string, notes: string, adminId: string) {
    const report = await this.prisma.report.findUnique({ where: { id } });
    if (!report) throw new NotFoundException('Report not found');

    return this.prisma.report.update({
      where: { id },
      data: {
        status: status as any,
        resolutionNotes: notes,
        resolvedById: adminId,
      },
    });
  }
}
