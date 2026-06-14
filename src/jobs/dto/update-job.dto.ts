import { z } from 'zod';
import { createJobSchema } from './create-job.dto';
import { JobStatus } from '../../infra/prisma/generated/client';

export const updateJobSchema = createJobSchema.partial().extend({
  status: z.nativeEnum(JobStatus).optional(),
});

export type UpdateJobDto = z.infer<typeof updateJobSchema>;
