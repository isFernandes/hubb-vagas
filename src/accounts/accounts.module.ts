import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { AccountsRepository } from '../repositories/accounts.repository';
import { PrismaAccountsRepository } from '../infra/prisma/prisma-repository/prisma-accounts.repository';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { CompaniesModule } from 'src/companies/companies.module';
import { MessagingModule } from '../infra/messaging/messaging.module';
import { AccountsConsumer } from './accounts.consumer';
import { UserProfileStrategy } from './strategies/user-profile.strategy';
import { CompanyProfileStrategy } from './strategies/company-profile.strategy';
import { ProfileStrategyRegistry } from './strategies/profile-strategy.registry';

@Module({
  imports: [AuthModule, UsersModule, CompaniesModule, MessagingModule],
  controllers: [AccountsController, AccountsConsumer],
  providers: [
    AccountsService,
    { provide: AccountsRepository, useClass: PrismaAccountsRepository },
    UserProfileStrategy,
    CompanyProfileStrategy,
    ProfileStrategyRegistry,
  ],
  exports: [AccountsService],
})
export class AccountsModule {}
