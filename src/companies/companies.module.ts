import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesRepository } from '../repositories/companies.repository';
import { PrismaCompaniesRepository } from '../infra/prisma/prisma-repository/prisma-companies.repository';

@Module({
  imports: [],
  providers: [
    CompaniesService,
    { provide: CompaniesRepository, useClass: PrismaCompaniesRepository },
  ],
  exports: [CompaniesService],
})
export class CompaniesModule {}