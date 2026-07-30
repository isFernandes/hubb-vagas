import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateAccountSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
});

export class UpdateAccountDto extends createZodDto(UpdateAccountSchema) {}
