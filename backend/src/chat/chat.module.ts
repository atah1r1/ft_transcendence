import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  providers: [PrismaService, ChatService, UserService, AuthService, JwtService],
  controllers: [ChatController],
  imports: [UserModule],
})
export class ChatModule {}
