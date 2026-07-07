import { Injectable } from '@nestjs/common';
import { ProfileCreationStrategy } from './profile-creation.strategy';
import { Role } from '../../decorators/role.enum';
import { UsersService } from '../../users/users.service';

@Injectable()
export class UserProfileStrategy implements ProfileCreationStrategy {
  readonly role = Role.User;

  constructor(private readonly usersService: UsersService) {}

  async create(accountId: string, profileData: any): Promise<void> {
    await this.usersService.create({
      ...profileData,
      account_id: accountId,
    });
    console.log(`User profile created for account ${accountId}`);
  }
}
