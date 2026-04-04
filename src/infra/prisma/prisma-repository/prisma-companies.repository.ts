import { Injectable } from '@nestjs/common';
import { CompaniesRepository } from 'src/repositories/companies.repository';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaCompaniesRepository implements CompaniesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any): Promise<any> {
    return this.prisma.company.create({ data });
  }

  async findAll(): Promise<any[]> {
    return this.prisma.company.findMany();
  }

  async findById(id: string): Promise<any> {
    return this.prisma.company.findUnique({ where: { id } });
  }

  async update(id: string, data: any): Promise<any> {
    return this.prisma.company.update({ where: { id }, data });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.company.delete({ where: { id } });
  }
}