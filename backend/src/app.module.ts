import { Module } from '@nestjs/common';
import { UserController } from './user/user.controller';
import { UserModule } from './user/user.module';
import { UserService } from './user/user.service';
import { AuthModule } from './auth/auth.module';
import { AuthController } from './auth/auth.controller';
import { FortyTwoStrategy } from './auth/42.strategy';
import { AuthService } from './auth/auth.service';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [UserModule, AuthModule],
  controllers: [UserController, AuthController],
  providers: [UserService, AuthService, PrismaService],
})
export class AppModule {}
