import { z } from 'zod';

export const createJobSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  requirements: z.string().min(10),
  location: z.string().min(2),
  contractType: z.string(),
  expiresAt: z.string().datetime(), // ISO 8601
  paymentAmountCents: z.number().int().positive(),
  positionsAvailable: z.number().int().positive().optional(),
  executionDate: z.string().datetime().optional(),
  durationHours: z.number().int().positive().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  enableStandby: z.boolean().optional().default(false),
});

export type CreateJobDto = z.infer<typeof createJobSchema>;
