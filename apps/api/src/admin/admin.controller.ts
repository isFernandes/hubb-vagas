import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../decorators/role.enum';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard-metrics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  getDashboardMetrics() {
    return this.adminService.getDashboardMetrics();
  }
}
