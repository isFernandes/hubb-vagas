import { Controller, Get, UseGuards, Query, Patch, Param, Body, Request } from '@nestjs/common';
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
}
