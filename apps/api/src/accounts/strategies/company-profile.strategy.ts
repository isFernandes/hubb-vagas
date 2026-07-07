import { Injectable } from '@nestjs/common';
import { ProfileCreationStrategy } from './profile-creation.strategy';
import { Role } from '../../decorators/role.enum';
import { CompaniesService } from '../../companies/companies.service';

@Injectable()
export class CompanyProfileStrategy implements ProfileCreationStrategy {
  readonly role = Role.Company;

  constructor(private readonly companiesService: CompaniesService) {}

  async create(accountId: string, profileData: any): Promise<void> {
    await this.companiesService.create({
      ...profileData,
      account_id: accountId,
    });
    console.log(`Company profile created for account ${accountId}`);
  }
}
