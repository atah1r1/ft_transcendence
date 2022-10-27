import { Module } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  providers: [AuthService, PrismaService, ChatService],
  controllers: [ChatController],
})
export class ChatModule {}
