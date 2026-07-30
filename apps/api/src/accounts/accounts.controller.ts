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
  BadRequestException,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import {
  type UpdatePasswordDto,
  updatePasswordSchema,
} from './dto/update-password.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../decorators/role.enum';
import { ZodValidationPipe } from '../infra/pipes/zod-validation.pipe';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  async create(@Body() createAccountDto: CreateAccountDto) {
    if (createAccountDto.role === 'COMPANY' && createAccountDto.cnpj) {
      const cleanCnpj = createAccountDto.cnpj.replace(/[.\-/]/g, '');
      try {
        const res = await fetch(
          `https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`,
        );
        if (!res.ok) {
          throw new BadRequestException(
            'CNPJ inválido ou inexistente na Receita Federal',
          );
        }
      } catch (error) {
        if (error instanceof BadRequestException) throw error;
        throw new BadRequestException(
          'Falha ao consultar CNPJ. Tente novamente mais tarde.',
        );
      }
    }
    return this.accountsService.create(createAccountDto);
  }

  @Get()
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  findAll() {
    return this.accountsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.accountsService.findOne(id);
  }

  @Patch('me/password')
  @UseGuards(JwtAuthGuard)
  updatePassword(
    @Request() req,
    @Body(new ZodValidationPipe(updatePasswordSchema))
    updateDto: UpdatePasswordDto,
  ) {
    return this.accountsService.updatePassword(req.user.id, updateDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateAccountDto: UpdateAccountDto) {
    return this.accountsService.update(id, updateAccountDto);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  remove(@Param('id') id: string) {
    return this.accountsService.remove(id);
  }
}
