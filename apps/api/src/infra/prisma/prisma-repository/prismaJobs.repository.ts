import { Injectable } from '@nestjs/common';
import { JobsRepository } from 'src/repositories/jobs.repository';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaJobsRepository implements JobsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any): Promise<any> {
    return this.prisma.job.create({ data });
  }

  async findAll(filters?: {
    location?: string;
    contractType?: string;
    companyId?: string;
    search?: string;
    status?: any;
    latitude?: number;
    longitude?: number;
    radius?: number;
  }): Promise<any[]> {
    const where: any = {};

    if (filters) {
      if (filters.status) {
        where.status = filters.status;
      }
      if (filters.location) {
        where.location = { contains: filters.location, mode: 'insensitive' };
      }
      if (filters.contractType) {
        where.contractType = filters.contractType;
      }
      if (filters.companyId) {
        where.companyId = filters.companyId;
      }
      if (filters.search) {
        where.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      if (filters.latitude !== undefined && filters.longitude !== undefined && filters.radius !== undefined) {
        const lat = parseFloat(filters.latitude as any);
        const lng = parseFloat(filters.longitude as any);
        const radiusKm = parseFloat(filters.radius as any);

        if (!isNaN(lat) && !isNaN(lng) && !isNaN(radiusKm)) {
          // Use raw query to retrieve IDs within radius
          const matchingJobs: { id: string }[] = await this.prisma.$queryRaw`
            SELECT id FROM jobs
            WHERE latitude IS NOT NULL AND longitude IS NOT NULL
              AND (6371 * acos(LEAST(1.0, 
                cos(radians(${lat})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${lng})) + 
                sin(radians(${lat})) * sin(radians(latitude))
              ))) <= ${radiusKm}
          `;

          const ids = matchingJobs.map(j => j.id);
          where.id = { in: ids };
        }
      }
    }

    return this.prisma.job.findMany({ where });
  }

  async findById(id: string): Promise<any> {
    return this.prisma.job.findUnique({
      where: { id },
      include: {
        applications: {
          include: {
            user: true,
          },
        },
        company: true,
      },
    });
  }

  async update(id: string, data: any): Promise<any> {
    return this.prisma.job.update({ where: { id }, data });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.job.delete({ where: { id } });
  }
}
