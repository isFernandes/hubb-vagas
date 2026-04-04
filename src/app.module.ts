import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CompaniesModule } from './companies/companies.module';
import { UsersModule } from './users/users.module';
import { JobsModule } from './jobs/jobs.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './infra/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AccountsModule } from './accounts/accounts.module';
import { UsersController } from './users/users.controller';
import { JobsController } from './jobs/jobs.controller';
import { CompaniesController } from './companies/companies.controller';
import { AccountsController } from './accounts/accounts.controller';

@Module({
  imports: [
    CompaniesModule,
    UsersModule,
    JobsModule,
    AuthModule,
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AccountsModule,
  ],
  controllers: [AppController, UsersController, JobsController, CompaniesController, AccountsController],
  providers: [AppService],
})
export class AppModule {}
