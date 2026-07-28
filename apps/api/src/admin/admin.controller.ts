import { Controller, Get, UseGuards, Query, Patch, Param, Body, Request, Post } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../decorators/role.enum';
import { AccountStatus } from '../infra/prisma/generated';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard-metrics')
  getDashboardMetrics() {
    return this.adminService.getDashboardMetrics();
  }

  @Get('users')
  getUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search: string = ''
  ) {
    return this.adminService.getUsers(Number(page), Number(limit), search);
  }

  @Patch('users/:id/status')
  updateUserStatus(
    @Param('id') id: string,
    @Body() body: { status: AccountStatus; reason: string },
    @Request() req: any
  ) {
    return this.adminService.updateUserStatus(id, body.status, body.reason, req.user.id);
  }

  @Get('reports')
  getReports(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status: string = ''
  ) {
    return this.adminService.getReports(Number(page), Number(limit), status);
  }

  @Patch('reports/:id/resolve')
  resolveReport(
    @Param('id') id: string,
    @Body() body: { status: string; notes?: string },
    @Request() req: any
  ) {
    return this.adminService.resolveReport(id, body.status, body.notes || '', req.user.id);
  }

  @Get('settings')
  getSettings() {
    return this.adminService.getSettings();
  }

  @Patch('settings')
  updateSettings(@Body() body: { platformFeePercentage: number; minimumJobPriceCents: number }) {
    return this.adminService.updateSettings(body.platformFeePercentage, body.minimumJobPriceCents);
  }

  @Post('admins')
  createAdmin(@Body() body: { email: string; passwordPlain: string }) {
    return this.adminService.createAdmin(body.email, body.passwordPlain);
  }
}
