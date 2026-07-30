import { z } from 'zod';

const isValidCPF = (cpf: string) => {
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
  const cpfDigits = cpf.split('').map((el) => +el);
  const rest = (count: number) =>
    ((cpfDigits
      .slice(0, count - 12)
      .reduce((soma, el, index) => soma + el * (count - index), 0) *
      10) %
      11) %
    10;
  return rest(10) === cpfDigits[9] && rest(11) === cpfDigits[10];
};

export const CreateAccountSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(['USER', 'ADMIN', 'COMPANY']),
    // User profile fields
    name: z.string().optional(),
    bio: z.string().optional(),
    // Company profile fields
    cnpj: z.string().optional(),
    contact: z.string().optional(),

    cpf: z
      .string()
      .optional()
      .superRefine((val, ctx) => {
        if (val && !isValidCPF(val)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'CPF inválido',
          });
        }
      }),
  })
  .superRefine((data, ctx) => {
    if (data.role === 'USER' && !data.cpf) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'CPF é obrigatório para Candidatos',
        path: ['cpf'],
      });
    }
  });

import { createZodDto } from 'nestjs-zod';

export class CreateAccountDto extends createZodDto(CreateAccountSchema) {}
