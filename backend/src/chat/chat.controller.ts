import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Room, User } from '@prisma/client';
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

  @Get('room/:roomId/members')
  async getRoomMembers(
    @Req() req: any,
    @Param('roomId') roomId: string,
  ): Promise<any[]> {
    try {
      const members = await this.chatService.getRoomMembersByRoomId(
        req.user.id,
        roomId,
      );
      return members;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get('messages/:roomId')
  async getMessages(@Req() req: any) {
    try {
      return await this.chatService.getMessagesByRoomIdFormatted(
        req.user.id,
        req.params.roomId,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('rooms')
  async getRooms(@Req() req: any): Promise<Room[]> {
    try {
      const rooms = await this.chatService.getRooms(req.user.id);
      if (!rooms) {
        return [];
      }
      return rooms;
    } catch (error) {
      throw new HttpException('No Rooms Found', HttpStatus.NOT_FOUND);
    }
  }

  @Get('rooms/search')
  async searchRooms(
    @Req() req: any,
    @Query('q') keyword: string,
  ): Promise<Room[]> {
    if (!keyword || keyword.length === 0) {
      return [];
    }
    try {
      const rooms = await this.chatService.findRoomsByName(
        req.user.id,
        keyword,
      );
      if (!rooms) {
        return [];
      }
      return rooms;
    } catch (error) {
      throw new HttpException('No Rooms match query', HttpStatus.NOT_FOUND);
    }
  }

  @Get('room/:roomId/friendstoadd')
  async getFriends(
    @Req() req: any,
    @Param('roomId') roomId: string,
  ): Promise<User[]> {
    try {
      const friends = await this.chatService.getFriendsForRoom(req.user.id, roomId);
      if (friends) {
        return friends;
      }
      return [];
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
}
