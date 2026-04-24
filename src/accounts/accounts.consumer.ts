import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ProfileStrategyRegistry } from './strategies/profile-strategy.registry';

@Controller()
export class AccountsConsumer {
  constructor(private readonly strategyRegistry: ProfileStrategyRegistry) {}

  @EventPattern('account_created')
  async handleAccountCreated(@Payload() data: any) {
    const { role, account_id, profileData } = data;

    console.log(
      `Processing profile creation for account ${account_id} with role ${role}`,
    );

    const strategy = this.strategyRegistry.getStrategy(role);

    if (!strategy) {
      console.warn(`No profile creation strategy found for role: ${role}`);
      return;
    }

    try {
      await strategy.create(account_id, profileData);
    } catch (error) {
      console.error(
        `Failed to create profile for account ${account_id} using ${strategy.constructor.name}:`,
        error,
      );
    }
  }
}
