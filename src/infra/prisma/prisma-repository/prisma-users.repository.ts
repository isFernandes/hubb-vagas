import { Injectable } from '@nestjs/common';
import { UsersRepository } from 'src/repositories/users.repository';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any): Promise<any> {
    return this.prisma.user.create({ data });
  }

  async findAll(): Promise<any[]> {
    return this.prisma.user.findMany();
  }

  async findById(id: string): Promise<any> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async update(id: string, data: any): Promise<any> {
    return this.prisma.user.update({ where: { id }, data });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}