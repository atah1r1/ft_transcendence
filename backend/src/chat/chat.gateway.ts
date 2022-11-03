import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { AuthService } from '../auth/auth.service';
import { ChatService } from './chat.service';
import { Socket } from 'socket.io';
import { RoomUser } from './models/room-user.interface';
import { WsGuard } from 'src/auth/guards/ws.guard';
import { UseGuards } from '@nestjs/common';

@UseGuards(WsGuard)
@WebSocketGateway({ namespace: 'chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private authService: AuthService,
    private chatService: ChatService,
  ) {}

  handleConnection(client: Socket, ...args: any[]) {
    console.log('connected');
    console.log('ID: ', client.data);
  }

  handleDisconnect(client: any) {
    console.log('disconnected');
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: any): string {
    return 'Hello world!';
  }

  // connectUserToJoinedRooms(userId: string, socket: Socket) {
  //   // NOTE: we assume User has list of roomUser objects
  //   // NOTE: For now we simulate this by filtering roomUsers
  //   // this should be done by Prisma
  //   const _roomUsers: RoomUser[] =
  //     this.chatService.chatProvider.roomUsers.filter(
  //       (ru) => ru.user.id === userId,
  //     );
  //   _roomUsers.forEach((ru) => {
  //     socket.join(ru.room.roomId);
  //   });
  // }
}
