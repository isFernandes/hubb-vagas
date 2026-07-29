import { Injectable, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async submitReview(
    applicationId: string,
    rating: number,
    comment: string,
    reviewerId: string,
    role: 'USER' | 'COMPANY'
  ) {
    const direction = role === 'COMPANY' ? 'COMPANY_TO_USER' : 'USER_TO_COMPANY';

    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true },
    });

    if (!application) {
      throw new BadRequestException('Application not found');
    }

    if (application.status !== 'APPROVED' || application.job.status !== 'CLOSED_HIRED') {
      throw new BadRequestException('Application must be APPROVED and Job must be CLOSED_HIRED');
    }

    // Verify ownership
    if (role === 'COMPANY' && application.job.companyId !== reviewerId) {
      throw new ForbiddenException('Not authorized');
    }
    if (role === 'USER' && application.userId !== reviewerId) {
      throw new ForbiddenException('Not authorized');
    }

    const existingReview = await this.prisma.review.findUnique({
      where: {
        applicationId_direction: {
          applicationId,
          direction,
        },
      },
    });

    if (existingReview) {
      throw new ConflictException('Review already exists');
    }

    // Create review
    const review = await this.prisma.review.create({
      data: {
        applicationId,
        direction,
        rating,
        comment,
      },
    });

    // Recalculate average
    if (direction === 'COMPANY_TO_USER') {
      await this.updateUserRating(application.userId);
    } else {
      await this.updateCompanyRating(application.job.companyId);
    }

    return review;
  }

  private async updateUserRating(userId: string) {
    const apps = await this.prisma.application.findMany({
      where: { userId },
      select: { id: true },
    });
    const appIds = apps.map((a) => a.id);

    const reviews = await this.prisma.review.findMany({
      where: { applicationId: { in: appIds }, direction: 'COMPANY_TO_USER' },
    });

    const reviewCount = reviews.length;
    const averageRating = reviewCount > 0 ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviewCount : 0;

    await this.prisma.user.update({
      where: { id: userId },
      data: { reviewCount, averageRating },
    });
  }

  private async updateCompanyRating(companyId: string) {
    const jobs = await this.prisma.job.findMany({
      where: { companyId },
      select: { id: true },
    });
    const jobIds = jobs.map((j) => j.id);

    const apps = await this.prisma.application.findMany({
      where: { jobId: { in: jobIds } },
      select: { id: true },
    });
    const appIds = apps.map((a) => a.id);

    const reviews = await this.prisma.review.findMany({
      where: { applicationId: { in: appIds }, direction: 'USER_TO_COMPANY' },
    });

    const reviewCount = reviews.length;
    const averageRating = reviewCount > 0 ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviewCount : 0;

    await this.prisma.company.update({
      where: { id: companyId },
      data: { reviewCount, averageRating },
    });
  }

  async getUserReviews(userId: string) {
    const apps = await this.prisma.application.findMany({
      where: { userId },
      select: { id: true, job: { include: { company: true } } },
    });
    const appIds = apps.map((a) => a.id);

    return this.prisma.review.findMany({
      where: { applicationId: { in: appIds }, direction: 'COMPANY_TO_USER' },
      include: { application: { include: { job: { include: { company: true } } } } },
    });
  }

  async getCompanyReviews(companyId: string) {
    const jobs = await this.prisma.job.findMany({
      where: { companyId },
      select: { id: true },
    });
    const jobIds = jobs.map((j) => j.id);

    const apps = await this.prisma.application.findMany({
      where: { jobId: { in: jobIds } },
      select: { id: true, user: true },
    });
    const appIds = apps.map((a) => a.id);

    return this.prisma.review.findMany({
      where: { applicationId: { in: appIds }, direction: 'USER_TO_COMPANY' },
      include: { application: { include: { user: true } } },
    });
  }
}
