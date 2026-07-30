export abstract class AccountsRepository {
  abstract create(data: any): Promise<any>;
  abstract createUserAccount(data: any): Promise<any>;
  abstract createCompanyAccount(data: any): Promise<any>;
  abstract findAll(): Promise<any[]>;
  abstract findById(id: string): Promise<any>;
  abstract findByEmail(email: string): Promise<any>;
  abstract update(id: string, data: any): Promise<any>;
  abstract remove(id: string): Promise<void>;
}
