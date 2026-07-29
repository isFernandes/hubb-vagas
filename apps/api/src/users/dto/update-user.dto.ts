import { z } from 'zod';
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export const updateUserProfileSchema = z.object({
  name: z.string().optional(),
  bio: z.string().optional(),
  cpf: z.string().optional(),
  avatarUrl: z.string().max(500000, 'Avatar image is too large').optional(),
});

export type UpdateUserProfileDto = z.infer<typeof updateUserProfileSchema>;
