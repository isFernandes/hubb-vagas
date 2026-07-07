import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { type CreateJobDto, createJobSchema } from './dto/create-job.dto';
import { type UpdateJobDto, updateJobSchema } from './dto/update-job.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../decorators/role.enum';
import { ZodValidationPipe } from '../infra/pipes/zod-validation.pipe';
import { JobStatus } from '../infra/prisma/generated/client';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @Roles(Role.Company)
  @UseGuards(JwtAuthGuard, RolesGuard)
  create(
    @Body(new ZodValidationPipe(createJobSchema)) createJobDto: CreateJobDto,
    @Request() req,
  ) {
    return this.jobsService.create(
      createJobDto,
      req.user.profileId,
      req.user.id,
    );
  }

  @Get()
  async findAll(
    @Query('location') location?: string,
    @Query('contractType') contractType?: string,
    @Query('companyId') companyId?: string,
    @Query('search') search?: string,
    @Request() req?,
  ) {
    let status: JobStatus | undefined = JobStatus.PUBLISHED; // default for Candidates / User

    const authHeader = req?.headers?.authorization;
    if (authHeader) {
      try {
        const token = authHeader.split(' ')[1];
        if (token) {
          const payloadBase64 = token.split('.')[1];
          const payloadJson = Buffer.from(payloadBase64, 'base64').toString(
            'ascii',
          );
          const payload = JSON.parse(payloadJson);
          if (payload.role === 'Company' || payload.role === 'Admin') {
            status = undefined; // Do not force PUBLISHED status for company/admin
          }
        }
      } catch {
        // ignore decoding errors
      }
    }

    return this.jobsService.findAll({
      location,
      contractType,
      companyId,
      search,
      status,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.Company)
  @UseGuards(JwtAuthGuard, RolesGuard)
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateJobSchema)) updateJobDto: UpdateJobDto,
    @Request() req,
  ) {
    return this.jobsService.update(
      id,
      updateJobDto,
      req.user.profileId,
      req.user.id,
    );
  }

  @Patch(':jobId/applications/:appId/approve')
  @Roles(Role.Company)
  @UseGuards(JwtAuthGuard, RolesGuard)
  approveApplication(
    @Param('jobId') jobId: string,
    @Param('appId') appId: string,
    @Request() req,
  ) {
    return this.jobsService.approveApplication(jobId, appId, req.user.profileId);
  }

  @Delete(':id')
  @Roles(Role.Company)
  @UseGuards(JwtAuthGuard, RolesGuard)
  remove(@Param('id') id: string, @Request() req) {
    return this.jobsService.remove(id, req.user.profileId);
  }
}
