import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(authDto: AuthDto) {
    const { email, password } = authDto;

    const user = await this.prisma.account.findUnique({
      where: { email },
      include: {
        user: true,
        company: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const profileId =
      user.role === 'Company' ? user.company?.id : user.user?.id;
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profileId: profileId,
      },
    };
  }

  passwordEncripty(password: string) {
    const passwordEncripted = bcrypt.hashSync(password, 10);
    return passwordEncripted;
  }
}
