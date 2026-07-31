import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const updateCompanyProfileSchema = z.object({
  name: z.string().optional(),
  contact: z.string().optional(),
  cnpj: z.string().optional(),
  avatarUrl: z
    .string()
    .max(500000, 'Avatar image is too large')
    .nullable()
    .optional(),
});

export class UpdateCompanyProfileDto extends createZodDto(
  updateCompanyProfileSchema,
) {}
export class UpdateCompanyDto extends createZodDto(
  updateCompanyProfileSchema,
) {}
