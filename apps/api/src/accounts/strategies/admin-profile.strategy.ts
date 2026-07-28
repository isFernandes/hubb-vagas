import { Injectable } from '@nestjs/common';
import { ProfileCreationStrategy } from './profile-creation.strategy';
import { Role } from '../../decorators/role.enum';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class AdminProfileStrategy implements ProfileCreationStrategy {
  readonly role = Role.Admin;

  constructor(private readonly prisma: PrismaService) {}

  async create(accountId: string, profileData: any): Promise<void> {
    await this.prisma.adminProfile.create({
      data: {
        accountId,
        name: profileData?.name || 'Admin',
      },
    });
    console.log(`Admin profile created for account ${accountId}`);
  }
}
