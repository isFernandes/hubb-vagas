import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  cpf: z.string().length(11),
  bio: z.string().optional(),
});

export class CreateUserDto extends createZodDto(CreateUserSchema) {}

const CreateCompanySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  cnpj: z.string().length(14),
  contact: z.string().optional(),
});

export class CreateCompanyDto extends createZodDto(CreateCompanySchema) {}
