export abstract class JobsRepository {
  abstract create(data: any): Promise<any>;
  abstract findAll(filters?: {
    location?: string;
    contractType?: string;
    companyId?: string;
    search?: string;
    status?: any;
  }): Promise<any[]>;
  abstract findById(id: string): Promise<any>;
  abstract update(id: string, data: any): Promise<any>;
  abstract remove(id: string): Promise<void>;
}
