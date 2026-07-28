import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    let profileId: string | undefined = undefined;

    if (payload.role === 'COMPANY') {
      const company = await this.prisma.company.findUnique({
        where: { account_id: payload.sub },
      });
      profileId = company?.id;
    } else if (payload.role === 'USER') {
      const user = await this.prisma.user.findUnique({
        where: { account_id: payload.sub },
      });
      profileId = user?.id;
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      profileId,
    };
  }
}
