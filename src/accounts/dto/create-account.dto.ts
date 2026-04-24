import { z } from 'zod';

export const CreateAccountSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['User', 'Admin', 'Company']),
  // User profile fields
  name: z.string().optional(),
  bio: z.string().optional(),
  // Company profile fields
  cnpj: z.string().optional(),
  contact: z.string().optional(),
});

export type CreateAccountDto = z.infer<typeof CreateAccountSchema>;