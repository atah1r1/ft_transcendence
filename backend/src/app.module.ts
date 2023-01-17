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
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { ChatService } from './chat/chat.service';
import { ChatGateway } from './chat/chat.gateway';
import { ChatController } from './chat/chat.controller';
import { ChatModule } from './chat/chat.module';
import { GameModule } from './game/game.module';
import { GameGateway } from './game/game.gateway';
import { GameService } from './game/game.service';

@Module({
  imports: [UserModule, AuthModule, ChatModule, GameModule],
  controllers: [UserController, AuthController, ChatController],
  providers: [
    UserService,
    AuthService,
    PrismaService,
    JwtService,
    CloudinaryService,
    ChatService,
    ChatGateway,
    GameGateway,
    GameService,
  ],
})
export class AppModule {}
