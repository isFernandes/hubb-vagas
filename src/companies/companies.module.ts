import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { CompaniesRepository } from '../repositories/companies.repository';
import { PrismaCompaniesRepository } from '../infra/prisma/prisma-repository/prismaCompanies.repository';

@Module({
  imports: [],
  controllers: [CompaniesController],
  providers: [
    CompaniesService,
    { provide: CompaniesRepository, useClass: PrismaCompaniesRepository },
  ],
  exports: [CompaniesService],
})
export class CompaniesModule {}
