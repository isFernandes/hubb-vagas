import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const updateUserProfileSchema = z.object({
  name: z.string().optional(),
  bio: z.string().optional(),
  cpf: z.string().optional(),
  avatarUrl: z
    .string()
    .max(500000, 'Avatar image is too large')
    .nullable()
    .optional(),
});

export class UpdateUserProfileDto extends createZodDto(
  updateUserProfileSchema,
) {}
export class UpdateUserDto extends createZodDto(updateUserProfileSchema) {}
