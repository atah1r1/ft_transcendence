import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GameService } from './game.service';

@Controller('game')
@UseGuards(AuthGuard('jwt'))
export class GameController {
  constructor(private gameService: GameService) {}

  @Get(':id/history')
  async getGameHistory(@Req() req: any, @Param('id') id: string) {
    try {
      const history = await this.gameService.getGameHistoryByUserId(
        req.user.id,
        id,
      );
      return history;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get('live')
  async getLiveGames(@Req() req: any) {
    try {
      const liveGames = await this.gameService.getLiveGames(req.user.id);
      return liveGames;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
}
