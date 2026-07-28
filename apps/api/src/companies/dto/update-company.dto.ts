import { z } from 'zod';
import { PartialType } from '@nestjs/mapped-types';
import { CreateCompanyDto } from './create-company.dto';

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {}

export const updateCompanyProfileSchema = z.object({
  name: z.string().optional(),
  contact: z.string().optional(),
  cnpj: z.string().optional(),
  avatarUrl: z.string().max(500000, "Avatar image is too large").optional(),
});

export type UpdateCompanyProfileDto = z.infer<
  typeof updateCompanyProfileSchema
>;
