import { Controller, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { DisputesService } from './disputes.service';

@Controller()
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Post('disputes')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.COMPANY)
  async createDispute(
    @Request() req: any,
    @Body('transactionId') transactionId: string,
    @Body('reason') reason: string,
  ) {
    // In a real system, req.user would have the account ID.
    // We'll mock it here or expect it in the body if it's not guarded.
    const companyAccountId = req.user?.accountId || req.body?.companyAccountId;
    return this.disputesService.createDispute(transactionId, reason, companyAccountId);
  }

  @Post('admin/disputes/:id/resolve')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.ADMIN)
  async resolveDispute(
    @Request() req: any,
    @Param('id') id: string,
    @Body('action') action: 'REFUND' | 'RELEASE',
  ) {
    const adminId = req.user?.accountId || 'mock-admin-id';
    return this.disputesService.resolveDispute(id, action, adminId);
  }
}
