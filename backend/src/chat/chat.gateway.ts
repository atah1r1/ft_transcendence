import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { AuthService } from '../auth/auth.service';
import { ChatService } from './chat.service';
import { Socket, Server } from 'socket.io';

const EV_CHAT_LIST = 'chat_list';
const EV_MESSAGE = 'message';
const EV_SEEN = 'seen';
const EV_ONLINE_FRIENDS = 'online_friends';
const EV_CREATE_DM = 'create_dm';
const EV_CREATE_ROOM = 'create_room';
const EV_JOIN_ROOM = 'join_room';
const EV_LEAVE_ROOM = 'leave_room';
const EV_BAN_USER = 'ban_user';
const EV_ROOM_MEMEBERS = 'room_members';
const EV_ADD_MEMBER = 'add_member';
const EV_REMOVE_MEMBER = 'remove_member';
const EV_MAKE_ADMIN = 'make_admin';
const EV_FIND_ROOM = 'find_room';

@WebSocketGateway({ namespace: 'chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private authService: AuthService,
    private chatService: ChatService,
  ) {}
  @WebSocketServer() server: Server;

  /* *******************
   *  HELPER METHODS   *
   ******************* */
  private async joinRooms(client: Socket) {
    // Join all the rooms the user is in.
    const rooms = await this.chatService.getRoomsByUserId(client.data.id);
    rooms.forEach((room) => {
      client.join(room.id);
    });
  }

  private async joinNewRoom(userId: string, roomId: string) {
    const sockets = this.chatService.getConnectedUserById(userId);
    if (!sockets || sockets.length === 0) return;
    sockets.forEach((s) => {
      s.join(roomId);
    });
  }

  private async leaveSocketRoom(userId: string, roomId: string) {
    const sockets = this.chatService.getConnectedUserById(userId);
    if (!sockets || sockets.length === 0) return;
    sockets.forEach((s) => {
      s.leave(roomId);
    });
  }

  private async sendChatsToClient(client: Socket) {
    // Send the list of chats to user.
    const chats = await this.chatService.getChatsByUserId(client.data.id);
    client.emit(EV_CHAT_LIST, chats);
  }

  private async sendChatsToUser(userId: string) {
    const sockets = this.chatService.getConnectedUserById(userId);
    if (!sockets || sockets.length === 0) return;
    const chats = await this.chatService.getChatsByUserId(userId);
    sockets.forEach((s) => {
      this.server.to(s.id).emit(EV_CHAT_LIST, chats);
    });
  }

  private async sendChatsToRoomMembers(roomId: string) {
    // Send the list of chats to all users in roomId.
    const memebers: any[] = await this.chatService.getRoomUsersByRoomId(roomId);
    memebers.forEach((member) => {
      const sockets = this.chatService.getConnectedUserById(member.userId);
      if (!sockets || sockets.length === 0) return;
      const chats = this.chatService.getChatsByUserId(member.userId);
      sockets.forEach((s) => {
        this.server.to(s.id).emit(EV_CHAT_LIST, chats);
      });
    });
  }

  private async sendOnlineFriendsOfUserId(userId: string) {
    // Get user friends.
    const friends = await this.chatService.getConnectedFriends(userId);

    // Send online friends to all user friends.
    friends.forEach(async (friend) => {
      const sockets = this.chatService.getConnectedUserById(friend.id);
      if (!sockets || sockets.length === 0) return;
      const onlineFriends = await this.chatService.getConnectedFriends(
        friend.id,
      );
      sockets.forEach((s) => {
        this.server.to(s.id).emit(EV_ONLINE_FRIENDS, onlineFriends);
      });
    });
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

  /* *******************
   *    VALIDATORS     *
   ******************* */
  private async validateMessage(payload: any) {
    if (!('roomId' in payload && 'message' in payload)) {
      throw new WsException({
        error: EV_MESSAGE,
        message: 'Invalid message object',
      });
    }
    if (
      typeof payload.roomId !== 'string' ||
      typeof payload.message !== 'string'
    ) {
      throw new WsException({
        error: EV_MESSAGE,
        message: 'Invalid message object',
      });
    }
  }

  private async validateSeen(payload: any) {
    if (!('roomId' in payload && 'seen' in payload)) {
      throw new WsException({ error: EV_SEEN, message: 'Invalid seen object' });
    }
    if (
      typeof payload.roomId !== 'string' ||
      typeof payload.seen !== 'boolean'
    ) {
      throw new WsException({ error: EV_SEEN, message: 'Invalid seen object' });
    }
  }

  private async validateCreateDm(payload: any) {
    if (
      !('otherUserId' in payload) ||
      typeof payload.otherUserId !== 'string'
    ) {
      throw new WsException({
        error: EV_CREATE_DM,
        message: 'Invalid create dm object',
      });
    }
  }

  private async validateCreateRoom(payload: any) {
    if (
      !(
        'name' in payload &&
        'isPasswordRequired' in payload &&
        'password' in payload &&
        'image' in payload
      )
    ) {
      throw new WsException({
        error: EV_CREATE_ROOM,
        message: 'Invalid create room object',
      });
    }

    if (
      typeof payload.name !== 'string' ||
      typeof payload.isPasswordRequired !== 'boolean' ||
      typeof payload.password !== 'string' ||
      typeof payload.image !== 'string'
    ) {
      throw new WsException({
        error: EV_CREATE_ROOM,
        message: 'Invalid create room object',
      });
    }
  }

  private async validateJoinRoom(payload: any) {
    if (!('roomId' in payload && 'password' in payload)) {
      throw new WsException({
        error: EV_JOIN_ROOM,
        message: 'Invalid join room object',
      });
    }
    if (
      typeof payload.roomId !== 'string' ||
      typeof payload.password !== 'string'
    ) {
      throw new WsException({
        error: EV_JOIN_ROOM,
        message: 'Invalid join room object',
      });
    }
  }

  private async validateLeaveRoom(payload: any) {
    if (!('roomId' in payload) || typeof payload.roomId !== 'string') {
      throw new WsException({
        error: EV_LEAVE_ROOM,
        message: 'Invalid leave room object',
      });
    }
  }

  private async validateBanUser(payload: any) {
    if (
      !('roomId' in payload && 'userToBanId' in payload && 'ban' in payload)
    ) {
      throw new WsException({
        error: EV_BAN_USER,
        message: 'Invalid ban user object',
      });
    }
    if (
      typeof payload.roomId !== 'string' ||
      typeof payload.userToBanId !== 'string' ||
      typeof payload.ban !== 'boolean'
    ) {
      throw new WsException({
        error: EV_BAN_USER,
        message: 'Invalid ban user object',
      });
    }
  }

  private async validateAddMember(payload: any) {
    if (!('roomId' in payload && 'userToAddId' in payload)) {
      throw new WsException({
        error: EV_ADD_MEMBER,
        message: 'Invalid add member object',
      });
    }
    if (
      typeof payload.roomId !== 'string' ||
      typeof payload.userToAddId !== 'string'
    ) {
      throw new WsException({
        error: EV_ADD_MEMBER,
        message: 'Invalid add member object',
      });
    }
  }

  /* **********************
   *  CONNECTION HANDLERS *
   ********************** */
  async handleConnection(client: Socket) {
    try {
      await this.verifyAndSave(client);
      // Add user to connectedUsers map.
      this.chatService.addConnectedUser(client.data.id, client);
      this.joinRooms(client);
      this.sendChatsToClient(client);
      this.sendOnlineFriendsToClient(client);
      this.sendOnlineFriendsOfUserId(client.data.id);
    } catch (err) {
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    if (client.data.id) {
      this.chatService.removeConnectedUser(client.data.id, client);
      this.sendOnlineFriendsOfUserId(client.data.id);
    }
    console.log('disconnected: ', client.id);
  }

  /* *******************
   *   EVENT HANDLERS  *
   ******************* */
  @SubscribeMessage(EV_MESSAGE)
  async sendMessage(client: Socket, payload: any) {
    this.validateMessage(payload);
    try {
      const ms = await this.chatService.createMessage(
        client.data.id,
        payload.roomId,
        payload.message,
      );
      this.chatService.updateSeenInRoom(client.data.id, payload.roomId, false);

      // Send message and chats.
      this.server.to(payload.roomId).emit(EV_MESSAGE, ms);
      this.sendChatsToRoomMembers(payload.roomId);
    } catch (err) {
      throw new WsException({
        error: EV_MESSAGE,
        message: err.message,
      });
    }
  }

  @SubscribeMessage(EV_SEEN)
  async sendSeen(client: Socket, payload: any) {
    this.validateSeen(payload);
    try {
      this.chatService.updateSeen(client.data.id, payload.roomId, payload.seen);
    } catch (err) {
      throw new WsException({
        error: EV_SEEN,
        message: err.message,
      });
    }
  }

  @SubscribeMessage(EV_CREATE_DM)
  async createDM(client: Socket, payload: any) {
    this.validateCreateDm(payload);
    try {
      const dm = await this.chatService.createDm(
        client.data.id,
        payload.otherUserId,
      );
      if (!dm) {
        throw new WsException({
          error: EV_CREATE_ROOM,
          message: 'Failed to create room',
        });
      }
      const members = await this.chatService.getRoomUsersByRoomId(dm.id);
      members.forEach((member) => {
        this.sendChatsToUser(member.id);
        this.joinNewRoom(member.id, dm.id);
      });
    } catch (err) {
      throw new WsException({
        error: EV_CREATE_DM,
        message: err.message,
      });
    }
  }

  @SubscribeMessage(EV_CREATE_ROOM)
  async createRoom(client: Socket, payload: any) {
    this.validateCreateRoom(payload);

    try {
      const room = await this.chatService.createRoom(
        client.data.id,
        payload.name,
        payload.image,
        payload.isPasswordRequired,
        payload.password,
      );

      if (!room) {
        throw new WsException({
          error: EV_CREATE_ROOM,
          message: 'Failed to create room',
        });
      }
      this.sendChatsToUser(client.data.id);
      this.joinNewRoom(client.data.id, room.id);
    } catch (err) {
      throw new WsException({
        error: EV_CREATE_DM,
        message: err.message,
      });
    }
  }

  @SubscribeMessage(EV_JOIN_ROOM)
  async joinRoom(client: Socket, payload: any) {
    this.validateJoinRoom(payload);
    try {
      const room = await this.chatService.getRoomById(payload.roomId);
      if (room && room.isDm) {
        throw new WsException({
          error: EV_JOIN_ROOM,
          message: 'Cannot join DM',
        });
      }

      const ru = this.chatService.addUserToRoom(
        client.data.id,
        payload.roomId,
        payload.password,
      );

      if (!ru) {
        throw new WsException({
          error: EV_JOIN_ROOM,
          message: 'Failed to join room',
        });
      }
      this.sendChatsToUser(client.data.id);
      this.joinNewRoom(client.data.id, room.id);
    } catch (err) {
      throw new WsException({
        error: EV_JOIN_ROOM,
        message: err.message,
      });
    }
  }

  @SubscribeMessage(EV_LEAVE_ROOM)
  async leaveRoom(client: Socket, payload: any) {
    this.validateLeaveRoom(payload);
    try {
      const ru = this.chatService.removeUserFromRoom(
        client.data.id,
        payload.roomId,
      );

      if (!ru) {
        throw new WsException({
          error: EV_LEAVE_ROOM,
          message: 'Failed to leave room',
        });
      }
      this.sendChatsToUser(client.data.id);
      this.leaveSocketRoom(client.data.id, payload.roomId);
    } catch (err) {
      throw new WsException({
        error: EV_LEAVE_ROOM,
        message: err.message,
      });
    }
  }

  @SubscribeMessage(EV_BAN_USER)
  async banMember(client: Socket, payload: any) {
    this.validateBanUser(payload);
    try {
      const ru = this.chatService.banUserFromRoom(
        client.data.id,
        payload.userToBanId,
        payload.roomId,
        payload.ban,
      );

      if (!ru) {
        throw new WsException({
          error: EV_BAN_USER,
          message: 'Failed to ban user',
        });
      }
      this.sendChatsToUser(client.data.id);
      if (payload.ban) {
        this.leaveSocketRoom(payload.userToBanId, payload.roomId);
      } else {
        this.joinNewRoom(payload.userToBanId, payload.roomId);
      }
    } catch (err) {
      throw new WsException({
        error: EV_BAN_USER,
        message: err.message,
      });
    }
  }

  @SubscribeMessage(EV_ADD_MEMBER)
  async addMember(client: Socket, payload: any) {
    this.validateAddMember(payload);
    try {
      const ru = this.chatService.addUserToRoomByAdmin(
        client.data.id,
        payload.userToAddId,
        payload.roomId,
      );

      if (!ru) {
        throw new WsException({
          error: EV_ADD_MEMBER,
          message: 'Failed to add member',
        });
      }
      this.sendChatsToUser(payload.userToAddId);
      this.joinNewRoom(payload.userToAddId, payload.roomId);
    } catch (err) {
      throw new WsException({
        error: EV_ADD_MEMBER,
        message: err.message,
      });
    }
  }

  @SubscribeMessage(EV_FIND_ROOM)
  async findRoom(client: Socket, roomName: string) {
    try {
      const rooms = await this.chatService.findRoomByName(
        client.data.id,
        roomName,
      );

      client.emit(EV_FIND_ROOM, rooms);
    } catch (err) {
      throw new WsException({
        error: EV_FIND_ROOM,
        message: err.message,
      });
    }
  }

  @SubscribeMessage(EV_ROOM_MEMEBERS)
  async getRoomMembers(client: Socket, roomId: string) {
    try {
      const ru = await this.chatService.getRoomUserByUserIdAndRoomId(
        client.data.id,
        roomId,
      );

      if (!ru) {
        throw new WsException({
          error: EV_ROOM_MEMEBERS,
          message: 'User is not in room',
        });
      }

      const members = await this.chatService.getRoomUsersByRoomId(roomId);

      client.emit(EV_ROOM_MEMEBERS, members);
    } catch (err) {
      throw new WsException({
        error: EV_ROOM_MEMEBERS,
        message: err.message,
      });
    }
  }
}
