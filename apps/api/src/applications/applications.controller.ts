import { Controller, Post, Body, UseGuards, Request, Get, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../decorators/role.enum';
import { ZodValidationPipe } from '../infra/pipes/zod-validation.pipe';
import { ApplicationsService } from './applications.service';
import {
  type CreateApplicationDto,
  createApplicationSchema,
} from './dto/create-application.dto';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @Roles(Role.User)
  @UseGuards(JwtAuthGuard, RolesGuard)
  create(
    @Body(new ZodValidationPipe(createApplicationSchema))
    dto: CreateApplicationDto,
    @Request() req,
  ) {
    return this.applicationsService.apply(dto.jobId, req.user.profileId);
  }

  @Get('conflicts/:jobId')
  @Roles(Role.User)
  @UseGuards(JwtAuthGuard, RolesGuard)
  checkConflicts(@Param('jobId') jobId: string, @Request() req) {
    return this.applicationsService.checkConflicts(jobId, req.user.profileId);
  }
}
