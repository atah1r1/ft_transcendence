import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { FortyTwoStrategy } from './42.strategy';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [],
  providers: [FortyTwoStrategy, AuthService, PrismaService],
  controllers: [AuthController]
})
export class AuthModule {}
