import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChatService } from './chat.service';

@Controller('chat')
@UseGuards(AuthGuard('jwt'))
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('chats')
  async getChats(@Req() req: any) {
    try {
      return await this.chatService.getChatsByUserId(req.user.id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('messages/:roomId')
  async getMessages(@Req() req: any) {
    console.log('PARAMS: ', req.params);
    try {
      return await this.chatService.getMessagesByRoomIdFormatted(
        req.user.id,
        req.params.roomId,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
