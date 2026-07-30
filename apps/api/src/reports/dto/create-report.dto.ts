import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ReportType } from '../../infra/prisma/generated/client';

export const CreateReportSchema = z.object({
  type: z.nativeEnum(ReportType),
  description: z.string().min(10),
  reportedAccountId: z.string().uuid().optional(),
  reportedJobId: z.string().uuid().optional(),
});

export class CreateReportDto extends createZodDto(CreateReportSchema) {}
