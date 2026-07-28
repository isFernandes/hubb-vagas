import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { PrismaService } from '../infra/prisma/prisma.service';

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
}
