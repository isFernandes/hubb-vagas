export abstract class ApplicationsRepository {
  abstract create(data: { userId: string; jobId: string }): Promise<any>;
  abstract findByUserAndJob(userId: string, jobId: string): Promise<any>;
}
