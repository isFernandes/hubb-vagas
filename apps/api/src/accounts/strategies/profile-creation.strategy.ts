import { Role } from '../../decorators/role.enum';

export interface ProfileCreationStrategy {
  role: Role;
  create(accountId: string, profileData: any): Promise<void>;
}
