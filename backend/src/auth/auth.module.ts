import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { FortyTwoStrategy } from './42.strategy';

@Module({
  imports: [],
  providers: [FortyTwoStrategy, AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
