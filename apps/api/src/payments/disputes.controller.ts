import { Controller, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { DisputesService } from './disputes.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../infra/prisma/generated/client';

@Controller()
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Post('disputes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.COMPANY)
  async createDispute(
    @Request() req: any,
    @Body('transactionId') transactionId: string,
    @Body('reason') reason: string,
  ) {
    const companyAccountId = req.user.accountId;
    return this.disputesService.createDispute(transactionId, reason, companyAccountId);
  }

  @Post('admin/disputes/:id/resolve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async resolveDispute(
    @Request() req: any,
    @Param('id') id: string,
    @Body('action') action: 'REFUND' | 'RELEASE',
  ) {
    const adminId = req.user.accountId;
    return this.disputesService.resolveDispute(id, action, adminId);
  }
}


