import { Injectable } from '@nestjs/common';
import { AccountsRepository } from 'src/repositories/accounts.repository';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaAccountsRepository implements AccountsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any): Promise<any> {
    return this.prisma.account.create({ data });
  }

  async createUserAccount(data: any): Promise<any> {
    return this.prisma.account.create({
      data: {
        email: data.email,
        password: data.password,
        role: 'USER',
        user: {
          create: {
            name: data.name,
            cpf: data.cpf,
            bio: data.bio,
          },
        },
      },
    });
  }

  async createCompanyAccount(data: any): Promise<any> {
    return this.prisma.account.create({
      data: {
        email: data.email,
        password: data.password,
        role: 'COMPANY',
        company: {
          create: {
            name: data.name,
            cnpj: data.cnpj,
            contact: data.contact,
          },
        },
      },
    });
  }

  async findAll(): Promise<any[]> {
    return this.prisma.account.findMany();
  }

  async findById(id: string): Promise<any> {
    return this.prisma.account.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<any> {
    return this.prisma.account.findUnique({ where: { email } });
  }

  async update(id: string, data: any): Promise<any> {
    return this.prisma.account.update({ where: { id }, data });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.account.delete({ where: { id } });
  }
}
