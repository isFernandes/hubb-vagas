import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepository } from 'src/repositories/users.repository';
import { PrismaUsersRepository } from '../infra/prisma/prisma-repository/prisma-users.repository';

@Module({
  imports: [],
  providers: [
    UsersService,
    { provide: UsersRepository, useClass: PrismaUsersRepository },
  ],
  exports: [UsersService],
})
export class UsersModule {}