import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from './generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    // Inicializa o Pool de conexões do pg usando a sua variável de ambiente
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    // Passa o pool para o adapter do Prisma
    const adapter = new PrismaPg(pool);

    // Inicializa o PrismaClient com o adapter customizado
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}


