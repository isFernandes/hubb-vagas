import { Controller, Post, Get, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../decorators/role.enum';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User, Role.Company)
  @Post('application/:applicationId')
  async submitReview(
    @Param('applicationId') applicationId: string,
    @Body() body: { rating: number; comment?: string },
    @Request() req
  ) {
    const role = req.user.role;
    const reviewerId = req.user.profileId;

    return this.reviewsService.submitReview(applicationId, body.rating, body.comment || '', reviewerId, role);
  }

  @Get('user/:userId')
  async getUserReviews(@Param('userId') userId: string) {
    return this.reviewsService.getUserReviews(userId);
  }

  @Get('company/:companyId')
  async getCompanyReviews(@Param('companyId') companyId: string) {
    return this.reviewsService.getCompanyReviews(companyId);
  }
}
