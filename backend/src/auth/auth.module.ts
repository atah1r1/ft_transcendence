import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { FortyTwoStrategy } from './42.strategy';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [JwtModule.register({})],
  providers: [FortyTwoStrategy, AuthService, PrismaService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
