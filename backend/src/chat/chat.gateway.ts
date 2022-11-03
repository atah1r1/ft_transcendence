import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { AuthService } from '../auth/auth.service';
import { ChatService } from './chat.service';
import { Socket } from 'socket.io';
import { RoomUser } from './models/room-user.interface';

@WebSocketGateway()
export class ChatGateway {
  constructor(
    private authService: AuthService,
    private chatService: ChatService,
  ) {}

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
