import { Module } from '@nestjs/common';
import { UserController } from './user/user.controller';
import { UserModule } from './user/user.module';
import { UserService } from './user/user.service';
import { AuthModule } from './auth/auth.module';
import { AuthController } from './auth/auth.controller';
import { FortyTwoStrategy } from './auth/42.strategy';
import { AuthService } from './auth/auth.service';
import { PrismaService } from './prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [UserModule, AuthModule, MulterModule.register({ dest: './uploads' })],
  controllers: [UserController, AuthController],
  providers: [UserService, AuthService, PrismaService, JwtService],
})
export class AppModule { }
