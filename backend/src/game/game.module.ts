import { Module } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { GameController } from './game.controller';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';

@Module({
  controllers: [GameController, AuthService],
  providers: [GameGateway, GameService],
  imports: [],
})
export class GameModule {}
