import { z } from 'zod';

export const UpdateAccountSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
});

export type UpdateAccountDto = z.infer<typeof UpdateAccountSchema>;
