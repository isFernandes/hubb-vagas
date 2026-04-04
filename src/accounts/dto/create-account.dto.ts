import {z} from 'zod';

export const CreateAccountSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  role: z.enum(['User', 'Admin', 'Company']),
});

export type CreateAccountDto = z.infer<typeof CreateAccountSchema>;