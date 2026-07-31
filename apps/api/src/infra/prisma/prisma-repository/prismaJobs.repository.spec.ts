import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PrismaJobsRepository } from './prismaJobs.repository';
import { PrismaService } from '../prisma.service';

describe('PrismaJobsRepository', () => {
  let repository: PrismaJobsRepository;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      job: {
        findMany: vi.fn(),
      },
      $queryRaw: vi.fn(),
    };
    repository = new PrismaJobsRepository(prisma);
  });

  describe('findAll with geolocation', () => {
    it('should query for ids using Haversine formula if latitude, longitude and radius are provided', async () => {
      prisma.$queryRaw.mockResolvedValue([{ id: 'job-1' }, { id: 'job-2' }]);
      prisma.job.findMany.mockResolvedValue([
        { id: 'job-1', title: 'Close Job' },
        { id: 'job-2', title: 'Very Close Job' },
      ]);

      const result = await repository.findAll({
        latitude: -23.55052,
        longitude: -46.633308,
        radius: 10,
      });

      expect(prisma.$queryRaw).toHaveBeenCalled();
      expect(prisma.job.findMany).toHaveBeenCalledWith({
        where: {
          id: { in: ['job-1', 'job-2'] },
        },
      });
      expect(result).toHaveLength(2);
    });

    it('should fall back to normal search if geolocation parameters are missing', async () => {
      prisma.job.findMany.mockResolvedValue([{ id: 'job-3' }]);

      await repository.findAll({
        search: 'Developer',
      });

      expect(prisma.$queryRaw).not.toHaveBeenCalled();
      expect(prisma.job.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { title: { contains: 'Developer', mode: 'insensitive' } },
            { description: { contains: 'Developer', mode: 'insensitive' } },
          ],
        },
      });
    });
  });
});
