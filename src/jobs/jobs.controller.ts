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
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { type CreateJobDto, createJobSchema } from './dto/create-job.dto';
import { type UpdateJobDto, updateJobSchema } from './dto/update-job.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../decorators/role.enum';
import { ZodValidationPipe } from '../infra/pipes/zod-validation.pipe';

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
    // Usando req.user.profileId assumindo que o payload contenha este dado associado à conta.
    return this.jobsService.create(createJobDto, req.user.profileId);
  }

  @Get()
  findAll() {
    return this.jobsService.findAll();
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
    return this.jobsService.update(id, updateJobDto, req.user.profileId);
  }

  @Delete(':id')
  @Roles(Role.Company)
  @UseGuards(JwtAuthGuard, RolesGuard)
  remove(@Param('id') id: string, @Request() req) {
    return this.jobsService.remove(id, req.user.profileId);
  }
}
