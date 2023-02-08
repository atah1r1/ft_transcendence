import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Req,
} from '@nestjs/common';
import { config } from 'dotenv';
import { PrismaService } from 'src/prisma/prisma.service';
import { REQUEST } from '@nestjs/core';

config();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => {
          let token = null;
          if (req && req.cookies) {
            token = req.cookies['jwt'];
          }
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: any, done: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.id },
    });
    if (
      user.two_factor_auth &&
      !user.code_verified &&
      request.url !== '/api/user/2fa/verify' &&
      request.url !== '/api/auth/logout'
    ) {
      throw new HttpException(
        'Please verify your code for two factory authentication',
        477,
      );
    }
    return user;
  }
}
