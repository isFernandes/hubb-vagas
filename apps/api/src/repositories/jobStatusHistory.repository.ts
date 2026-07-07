import { JobStatus, JobStatusHistory } from '../infra/prisma/generated/client';

export abstract class JobStatusHistoryRepository {
  abstract create(data: {
    jobId: string;
    status: JobStatus;
    changedById: string;
    reason?: string;
  }): Promise<JobStatusHistory>;
}
