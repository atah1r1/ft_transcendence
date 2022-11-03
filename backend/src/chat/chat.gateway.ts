import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
  WsResponse,
} from '@nestjs/websockets';
import { AuthService } from '../auth/auth.service';
import { ChatService } from './chat.service';
import { Socket, Server } from 'socket.io';
import { RoomUser } from './models/room-user.interface';

const EV_CHAT_LIST = 'chat_list';
const EV_MESSAGE = 'message';
const EV_ONLINE_FRIENDS = 'online_friends';

@WebSocketGateway({ namespace: 'chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private authService: AuthService,
    private chatService: ChatService,
  ) {}

  @WebSocketServer() server: Server;

  private async joinRooms(client: Socket) {
    // Join all the rooms the user is in.
    const rooms = await this.chatService.getRoomsByUserId(client.data.id);
    rooms.forEach((room) => {
      client.join(room.id);
    });
  }

  private async sendChatsToClient(client: Socket) {
    // Send the list of chats to user.
    const chats = await this.chatService.getChatsByUserId(client.data.id);
    client.emit(EV_CHAT_LIST, chats);
  }

  private async sendChatsToRoomMembers(roomId: string) {
    // Send the list of chats to all users in roomId.
    const memebers: any[] = await this.chatService.getRoomUsersByRoomId(roomId);
    memebers.forEach((member) => {
      const socketIds = this.chatService.getConnectedUserById(member.userId);
      if (!socketIds || socketIds.length === 0) return;

      const chats = this.chatService.getChatsByUserId(member.userId);

      socketIds.forEach((socketId) => {
        this.server.to(socketId).emit(EV_CHAT_LIST, chats);
      });
    });
  }

  private async sendOnlineFriendsOfUserId(userId: string) {
    const friends = this.chatService.getConnectedFriends(client.data.id);
    client.emit(EV_ONLINE_FRIENDS, friends);
  }

  private async sendOnlineFriendsToClient(client: Socket) {
    const friends = this.chatService.getConnectedFriends(client.data.id);
    client.emit(EV_ONLINE_FRIENDS, friends);
  }

  private async verifyAndSave(client: Socket) {
    const token: string = client.handshake.headers.token as string;
    console.log('token: ', token);
    const decoded = await this.authService.verifyToken(token);
    // save the user id in the socket
    client.data = decoded;
  }

  private async validateMessage(payload: any) {
    if (!('roomId' in payload && 'message' in payload)) {
      throw new WsException('Invalid message');
    }
    if (
      typeof payload.roomId !== 'string' ||
      typeof payload.message !== 'string'
    ) {
      throw new WsException('Invalid message');
    }
  }

  async handleConnection(client: Socket, ...args: any[]) {
    try {
      await this.verifyAndSave(client);
      // Add user to connectedUsers map.
      this.chatService.addConnectedUser(client.data.id, client.id);
      this.joinRooms(client);
      this.sendChatsToClient(client);
    } catch (err) {
      client.disconnect();
    }
  }

  handleDisconnect(client: any) {
    console.log('disconnected');
  }

  @SubscribeMessage(EV_MESSAGE)
  async handleMessage(client: Socket, payload: any) {
    this.validateMessage(payload);
    try {
      const ms = await this.chatService.createMessage(
        client.data.id,
        payload.roomId,
        payload.message,
      );
      this.server.to(payload.roomId).emit(EV_MESSAGE, ms);
    } catch (err) {
      throw new WsException({
        error: 'message',
        message: err.message,
      });
    }
  }
}
