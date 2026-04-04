import { Injectable } from '@nestjs/common';
import { CompaniesRepository } from '../repositories/companies.repository';

@Injectable()
export class CompaniesService {
  constructor(private readonly companiesRepository: CompaniesRepository) {}

  async create(data: any) {
    return this.companiesRepository.create(data);
  }

  async findAll() {
    return this.companiesRepository.findAll();
  }

  async findOne(id: string) {
    return this.companiesRepository.findById(id);
  }

  async update(id: string, data: any) {
    return this.companiesRepository.update(id, data);
  }

  async remove(id: string) {
    return this.companiesRepository.remove(id);
  }
}