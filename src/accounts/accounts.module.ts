import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { AccountsRepository } from '../repositories/accounts.repository';
import { PrismaAccountsRepository } from '../infra/prisma/prisma-repository/prisma-accounts.repository';

@Module({
  imports: [],
  controllers: [AccountsController],
  providers: [
    AccountsService,
    { provide: AccountsRepository, useClass: PrismaAccountsRepository },
  ],
  exports: [AccountsService],
})
export class AccountsModule {}
