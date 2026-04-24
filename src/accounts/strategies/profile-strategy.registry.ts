import { Injectable, OnModuleInit } from '@nestjs/common';
import { Role } from '../../decorators/role.enum';
import { ProfileCreationStrategy } from './profile-creation.strategy';
import { UserProfileStrategy } from './user-profile.strategy';
import { CompanyProfileStrategy } from './company-profile.strategy';

@Injectable()
export class ProfileStrategyRegistry implements OnModuleInit {
  private readonly strategies = new Map<Role, ProfileCreationStrategy>();

  constructor(
    private readonly userProfileStrategy: UserProfileStrategy,
    private readonly companyProfileStrategy: CompanyProfileStrategy,
  ) {}

  onModuleInit() {
    this.strategies.set(Role.User, this.userProfileStrategy);
    this.strategies.set(Role.Company, this.companyProfileStrategy);
  }

  getStrategy(role: Role): ProfileCreationStrategy | undefined {
    return this.strategies.get(role);
  }
}
