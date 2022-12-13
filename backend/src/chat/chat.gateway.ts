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
import { RoomUser, RoomUserStatus } from '@prisma/client';
import { UserService } from 'src/user/user.service';

const EV_CHAT_LIST = 'chat_list';
const EV_MESSAGE = 'message';
const EV_SEEN = 'seen';
const EV_CREATE_DM = 'create_dm';
const EV_CREATE_ROOM = 'create_room';
const EV_JOIN_ROOM = 'join_room';
const EV_LEAVE_ROOM = 'leave_room';
const EV_BAN_USER = 'ban_user';
const EV_MUTE_USER = 'mute_user';
const EV_UNBAN_USER = 'unban_user';
const EV_UNMUTE_USER = 'unmute_user';
const EV_ROOM_MEMEBERS = 'room_members';
const EV_ADD_MEMBER = 'add_member';
const EV_MAKE_ADMIN = 'make_admin';
const EV_FIND_ROOM = 'find_room';
const EV_BLOCK_USER = 'block_user';

const EV_EMIT_ONLINE_FRIENDS = 'online_friends';
const EV_EMIT_ROOM_CREATED = 'room_created';
const EV_EMIT_ROOM_JOINED = 'room_joined';
const EV_EMIT_ROOM_LEFT = 'room_left';
const EV_EMIT_MEMBER_ADDED = 'member_added';
const EV_EMIT_ADMIN_MADE = 'admin_made';
const EV_EMIT_MEMBER_STATUS_CHANGED = 'member_status_changed';
const EV_EMIT_USER_BLOCKED = 'user_blocked';
const EV_EMIT_NEW_ROOM = 'room_created_notif';

@WebSocketGateway({ namespace: 'chat', cors: true, origins: '*' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private authService: AuthService,
    private chatService: ChatService,
    private userService: UserService,
  ) {}
  @WebSocketServer() server: Server;

  /* **********************
   *  CONNECTION HANDLERS *
   ********************** */
  async handleConnection(client: Socket) {
    try {
      await this.verifyAndSave(client);
      // Add user to connectedUsers map.
      // console.log('CONNECT ID: ', client.data.id);
      this.chatService.addConnectedUser(client.data.id, client);
      await this.joinIORooms(client);
      await this.sendChatsToClient(client);
      await this.sendOnlineFriendsToClient(client);
      await this.sendOnlineFriendsOfUserId(client.data.id);
    } catch (err) {
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    if (client.data.id) {
      this.chatService.removeConnectedUser(client.data.id, client);
      await this.sendOnlineFriendsOfUserId(client.data.id);
    }
    // console.log('disconnected: ', client.id);
  }

  /* *******************
   *   EVENT HANDLERS  *
   ******************* */
  @SubscribeMessage(EV_MESSAGE)
  async sendMessage(client: Socket, payload: any) {
    this.validateMessage(payload);
    try {
      const formattedMessage = await this.chatService.createMessage(
        client.data.id,
        payload.roomId,
        payload.message,
      );
      await this.chatService.updateSeenInRoom(
        client.data.id,
        payload.roomId,
        false,
      );
      // Send message and chats.
      await this.sendChatsToRoomMembers(client.data.id, payload.roomId);
      // this.server.to(payload.roomId).emit(EV_MESSAGE, formattedMessage);
      await this.sendMessageToRoomMembers(
        client.data.id,
        payload.roomId,
        formattedMessage,
      );
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
      await this.chatService.updateSeen(
        client.data.id,
        payload.roomId,
        payload.seen,
      );
      await this.sendChatsToClient(client);
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
      const chat = await this.chatService.createDm(
        client.data.id,
        payload.otherUserId,
      );
      if (!chat) {
        throw new WsException({
          error: EV_CREATE_ROOM,
          message: 'Failed to create room',
        });
      }
      const members = await this.chatService.getRoomUsersByRoomId(
        client.data.id,
        chat.roomId,
      );
      for (const member of members) {
        this.joinIORoom(member.userId, chat.roomId);
        await this.sendChatsToUser(member.userId);
      }
      await this.sendOnlineFriendsToClient(client);
      await this.sendOnlineFriendsOfUserId(client.data.id);
      await this.sendRoomCreatedToClient(client.data.id, chat);
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
      const chat = await this.chatService.createRoom(
        client.data.id,
        payload.name,
        payload.image,
        payload.privacy,
        payload.password,
      );

      if (!chat) {
        throw new WsException({
          error: EV_CREATE_ROOM,
          message: 'Failed to create room',
        });
      }

      this.joinIORoom(client.data.id, chat.roomId);
      await this.sendChatsToUser(client.data.id);
      await this.sendRoomCreatedToClient(client.data.id, chat);
    } catch (err) {
      throw new WsException({
        error: EV_CREATE_ROOM,
        message: err.message,
      });
    }
  }

  @SubscribeMessage(EV_JOIN_ROOM)
  async joinRoom(client: Socket, payload: any) {
    this.validateJoinRoom(payload);
    try {
      const ru = await this.chatService.selfJoinRoom(
        client.data.id,
        payload.roomId,
        payload.password,
      );
      this.joinIORoom(client.data.id, payload.roomId);
      this.sendChatsToUser(client.data.id);
      this.sendRoomJoinedToClients(client.data.id, payload.roomId, ru);
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
      const ru = await this.chatService.removeUserFromRoom(
        client.data.id,
        payload.roomId,
      );

      if (!ru) {
        throw new WsException({
          error: EV_LEAVE_ROOM,
          message: 'Failed to leave room',
        });
      }
      await this.sendChatsToUser(client.data.id);
      await this.leaveIORoom(client.data.id, payload.roomId);
      await this.sendRoomLeftToClients(client.data.id, payload.roomId, ru);
    } catch (err) {
      throw new WsException({
        error: EV_LEAVE_ROOM,
        message: err.message,
      });
    }
  }

  @SubscribeMessage(EV_BAN_USER)
  async banMember(client: Socket, payload: any) {
    this.validateUserStatus(payload, EV_BAN_USER);
    try {
      const ru = await this.chatService.updateUserStatusByAdmin(
        client.data.id,
        payload.targetUserId,
        payload.roomId,
        RoomUserStatus.BANNED,
      );

      if (!ru) {
        throw new WsException({
          error: EV_BAN_USER,
          message: 'Failed to ban user',
        });
      }
      await this.leaveIORoom(payload.targetUserId, payload.roomId);
      await this.sendChatsToUser(client.data.id);
      await this.sendChatsToUser(ru.userId);
      await this.sendMemberStatusToClient(client.data.id, ru);
      await this.sendMemberStatusToClient(ru.userId, ru);
    } catch (err) {
      throw new WsException({
        error: EV_BAN_USER,
        message: err.message,
      });
    }
  }

  @SubscribeMessage(EV_UNBAN_USER)
  async unbanMember(client: Socket, payload: any) {
    this.validateUserStatus(payload, EV_UNBAN_USER);
    try {
      const ru = await this.chatService.updateUserStatusByAdmin(
        client.data.id,
        payload.targetUserId,
        payload.roomId,
        RoomUserStatus.NORMAL,
      );
      this.joinIORoom(payload.targetUserId, payload.roomId);
      await this.sendChatsToUser(payload.targetUserId);
      if (!ru) {
        throw new WsException({
          error: EV_UNBAN_USER,
          message: 'Failed to unban user',
        });
      }
      this.joinIORoom(payload.targetUserId, payload.roomId);
      await this.sendChatsToUser(client.data.id);
      await this.sendChatsToUser(ru.userId);
      await this.sendMemberStatusToClient(client.data.id, ru);
      await this.sendMemberStatusToClient(ru.userId, ru);
    } catch (err) {
      throw new WsException({
        error: EV_UNBAN_USER,
        message: err.message,
      });
    }
  }

  @SubscribeMessage(EV_MUTE_USER)
  async muteMember(client: Socket, payload: any) {
    this.validateUserStatus(payload, EV_MUTE_USER);
    try {
      const ru = await this.chatService.updateUserStatusByAdmin(
        client.data.id,
        payload.targetUserId,
        payload.roomId,
        RoomUserStatus.MUTED,
      );

      if (!ru) {
        throw new WsException({
          error: EV_MUTE_USER,
          message: 'Failed to mute user',
        });
      }
      await this.sendChatsToUser(client.data.id);
      await this.sendMemberStatusToClient(client.data.id, ru);
      await this.sendMemberStatusToClient(ru.userId, ru);
    } catch (err) {
      throw new WsException({
        error: EV_MUTE_USER,
        message: err.message,
      });
    }
  }

  @SubscribeMessage(EV_UNMUTE_USER)
  async unmuteMember(client: Socket, payload: any) {
    this.validateUserStatus(payload, EV_UNMUTE_USER);
    try {
      const ru = await this.chatService.updateUserStatusByAdmin(
        client.data.id,
        payload.targetUserId,
        payload.roomId,
        RoomUserStatus.NORMAL,
      );

      if (!ru) {
        throw new WsException({
          error: EV_UNMUTE_USER,
          message: 'Failed to unmute user',
        });
      }
      await this.sendChatsToUser(client.data.id);
      await this.sendMemberStatusToClient(client.data.id, ru);
      await this.sendMemberStatusToClient(ru.userId, ru);
    } catch (err) {
      throw new WsException({
        error: EV_UNMUTE_USER,
        message: err.message,
      });
    }
  }

  @SubscribeMessage(EV_ADD_MEMBER)
  async addMember(client: Socket, payload: any) {
    this.validateAddMember(payload);
    try {
      const ru = await this.chatService.addUserToRoomByAdmin(
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
      this.joinIORoom(payload.userToAddId, payload.roomId);
      await this.sendChatsToUser(payload.userToAddId);
      await this.sendMemberAddedToClient(client.data.id, ru);
    } catch (err) {
      throw new WsException({
        error: EV_ADD_MEMBER,
        message: err.message,
      });
    }
  }

  @SubscribeMessage(EV_MAKE_ADMIN)
  async makeAdmin(client: Socket, payload: any) {
    this.validateMakeAdmin(payload);
    try {
      const ru = await this.chatService.makeUserAdmin(
        client.data.id,
        payload.targetUserId,
        payload.roomId,
      );
      await this.sendAdminMadeToClients(client.data.id, payload.roomId, ru);
      await this.sendChatsToUser(client.data.id);
    } catch (err) {
      throw new WsException({
        error: EV_MAKE_ADMIN,
        message: err.message,
      });
    }
  }

  @SubscribeMessage(EV_BLOCK_USER)
  async blockUser(client: Socket, payload: any) {
    this.validateBlockUser(payload);
    try {
      const dm = await this.chatService.getDmByUserIds(
        client.data.id,
        payload.targetUserId,
      );
      if (dm) {
        await this.chatService.deleteDm(dm.id);
      }
      await this.userService.blockUser(client.data.id, payload.targetUserId);
      await this.sendChatsToUser(client.data.id);
      if (dm) await this.sendChatsToUser(payload.targetUserId);
      await this.sendOnlineFriendsToUser(client.data.id);
      if (dm) await this.sendOnlineFriendsToUser(payload.targetUserId);
      await this.sendUserBlockedToUser(client.data.id, payload.targetUserId);
      await this.sendUserBlockedToUser(payload.targetUserId, client.data.id);
    } catch (err) {
      throw new WsException({
        error: EV_BLOCK_USER,
        message: err.message,
      });
    }
  }

  @SubscribeMessage(EV_FIND_ROOM)
  async findRoom(client: Socket, roomName: string) {
    try {
      const rooms = await this.chatService.findRoomsByName(
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
      const members = await this.chatService.getRoomMembersByRoomId(
        client.data.id,
        roomId,
      );

      client.emit(EV_ROOM_MEMEBERS, members);
    } catch (err) {
      throw new WsException({
        error: EV_ROOM_MEMEBERS,
        message: err.message,
      });
    }
  }

  /* *******************
   *  HELPER METHODS   *
   ******************* */
  private async joinIORooms(client: Socket) {
    // Join all the rooms the user is in.
    const rooms = await this.chatService.getRoomsByUserId(client.data.id);
    rooms.forEach((room) => {
      client.join(room.id);
    });
  }

  private joinIORoom(userId: string, roomId: string) {
    const sockets = this.chatService.getConnectedUserById(userId);
    if (!sockets || sockets.length === 0) return;
    sockets.forEach((s) => {
      s.join(roomId);
    });
  }

  private async leaveIORoom(userId: string, roomId: string) {
    const sockets = this.chatService.getConnectedUserById(userId);
    if (!sockets || sockets.length === 0) return;
    sockets.forEach((s) => {
      s.leave(roomId);
    });
  }

  private async sendChatsToClient(client: Socket) {
    const chats = await this.chatService.getChatsByUserId(client.data.id);
    client.emit(EV_CHAT_LIST, chats);
  }

  private async sendChatsToUser(userId: string) {
    const sockets = this.chatService.getConnectedUserById(userId);
    if (!sockets || sockets.length === 0) return;
    const chats = await this.chatService.getChatsByUserId(userId);
    // console.log('NUM CHATS: ', chats.length);
    for (const socket of sockets) {
      this.server.to(socket.id).emit(EV_CHAT_LIST, chats);
    }
  }

  private async sendMessageToRoomMembers(
    userId: string,
    roomId: string,
    message: any,
  ) {
    // Send message to all users in roomId.
    const memebers: any[] = await this.chatService.getRoomUsersByRoomId(
      userId,
      roomId,
    );
    // send message to other members.
    memebers.forEach(async (member) => {
      if (member.status === RoomUserStatus.BANNED) return;
      const sockets = this.chatService.getConnectedUserById(member.userId);
      if (!sockets || sockets.length === 0) return;
      sockets.forEach((s) => {
        this.server.to(s.id).emit(EV_MESSAGE, message);
      });
    });
  }

  private async sendChatsToRoomMembers(userId: string, roomId: string) {
    // Send the list of chats to all users in roomId.
    const memebers: any[] = await this.chatService.getRoomUsersByRoomId(
      userId,
      roomId,
    );
    memebers.forEach(async (member) => {
      if (member.status === RoomUserStatus.BANNED) return;
      const sockets = this.chatService.getConnectedUserById(member.userId);
      if (!sockets || sockets.length === 0) return;
      const chats = await this.chatService.getChatsByUserId(member.userId);
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
        this.server.to(s.id).emit(EV_EMIT_ONLINE_FRIENDS, onlineFriends);
      });
    });
  }

  private async sendOnlineFriendsToClient(client: Socket) {
    const friends = await this.chatService.getConnectedFriends(client.data.id);
    client.emit(EV_EMIT_ONLINE_FRIENDS, friends);
  }

  private async sendOnlineFriendsToUser(userId: string) {
    const sockets = this.chatService.getConnectedUserById(userId);
    if (!sockets || sockets.length === 0) return;
    const onlineFriends = await this.chatService.getConnectedFriends(userId);
    sockets.forEach((s) => {
      this.server.to(s.id).emit(EV_EMIT_ONLINE_FRIENDS, onlineFriends);
    });
  }

  private async sendUserBlockedToUser(userId: string, blockedUserId: string) {
    const sockets = this.chatService.getConnectedUserById(userId);
    if (!sockets || sockets.length === 0) return;
    sockets.forEach((s) => {
      this.server.to(s.id).emit(EV_EMIT_USER_BLOCKED, blockedUserId);
    });
  }

  private async verifyAndSave(client: Socket) {
    const token: string = client.handshake.auth.token as string;
    // console.log('token: ', token);
    const decoded = await this.authService.verifyToken(token);
    // save the user id in the socket
    client.data = decoded;
  }

  private async sendRoomCreatedToClient(userId: string, chat: any) {
    const sockets = this.chatService.getConnectedUserById(userId);
    if (!sockets || sockets.length === 0) return;
    sockets.forEach((s) => {
      this.server.to(s.id).emit(EV_EMIT_ROOM_CREATED, chat);
    });
    this.server.emit(EV_EMIT_NEW_ROOM, chat);
  }

  private async sendRoomJoinedToClients(
    userId: string,
    roomId: string,
    rUser: RoomUser,
  ) {
    const room = await this.chatService.getRoomById(roomId, true);
    const members = room.members;
    members.forEach(async (member: any) => {
      if (member.status === RoomUserStatus.BANNED) return;
      const chat = await this.chatService.formatChat(member.userId, room, true);
      const sockets = this.chatService.getConnectedUserById(member.userId);
      if (!sockets || sockets.length === 0) return;
      sockets.forEach((s) => {
        this.server
          .to(s.id)
          .emit(EV_EMIT_ROOM_JOINED, { roomUser: rUser, chat: chat });
      });
    });
  }

  private async sendRoomLeftToClients(
    userId: string,
    roomId: string,
    rUser: RoomUser,
  ) {
    const sockets = this.chatService.getConnectedUserById(rUser.userId);
    sockets.forEach((s) => {
      this.server.to(s.id).emit(EV_EMIT_ROOM_LEFT, rUser);
    });

    const members = await this.chatService.getRoomUsersByRoomId(userId, roomId);
    members.forEach((member) => {
      if (member.status === RoomUserStatus.BANNED) return;
      const sockets = this.chatService.getConnectedUserById(member.userId);
      if (!sockets || sockets.length === 0) return;
      sockets.forEach((s) => {
        s.emit(EV_EMIT_ROOM_LEFT, rUser);
      });
    });
  }

  private async sendAdminMadeToClients(
    userId: string,
    roomId: string,
    rUser: RoomUser,
  ) {
    const members = await this.chatService.getRoomUsersByRoomId(userId, roomId);
    members.forEach((member) => {
      if (member.status === RoomUserStatus.BANNED) return;
      const sockets = this.chatService.getConnectedUserById(member.userId);
      if (!sockets || sockets.length === 0) return;
      sockets.forEach((s) => {
        this.server.to(s.id).emit(EV_EMIT_ADMIN_MADE, rUser);
      });
    });
  }

  private async sendMemberAddedToClient(userId: string, rUser: RoomUser) {
    const sockets = this.chatService.getConnectedUserById(userId);
    if (!sockets || sockets.length === 0) return;
    sockets.forEach((s) => {
      this.server.to(s.id).emit(EV_EMIT_MEMBER_ADDED, rUser);
    });
  }

  private async sendMemberStatusToClient(userId: string, rUser: RoomUser) {
    const sockets = this.chatService.getConnectedUserById(userId);
    if (!sockets || sockets.length === 0) return;
    sockets.forEach((s) => {
      this.server.to(s.id).emit(EV_EMIT_MEMBER_STATUS_CHANGED, rUser);
    });
  }

  /* *******************
   *    VALIDATORS     *
   ******************* */
  private validateMessage(payload: any) {
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

  private validateSeen(payload: any) {
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

  private validateCreateDm(payload: any) {
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

  private validateCreateRoom(payload: any) {
    if (
      !(
        'name' in payload &&
        'privacy' in payload &&
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
      typeof payload.privacy !== 'string' ||
      typeof payload.password !== 'string' ||
      typeof payload.image !== 'string'
    ) {
      throw new WsException({
        error: EV_CREATE_ROOM,
        message: 'Invalid create room object',
      });
    }
  }

  private validateJoinRoom(payload: any) {
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

  private validateLeaveRoom(payload: any) {
    if (!('roomId' in payload) || typeof payload.roomId !== 'string') {
      throw new WsException({
        error: EV_LEAVE_ROOM,
        message: 'Invalid leave room object',
      });
    }
  }

  private validateUserStatus(payload: any, eventName: string) {
    if (!('roomId' in payload && 'targetUserId' in payload)) {
      throw new WsException({
        error: eventName,
        message: 'Invalid user status object',
      });
    }
    if (
      typeof payload.roomId !== 'string' ||
      typeof payload.targetUserId !== 'string'
    ) {
      throw new WsException({
        error: eventName,
        message: 'Invalid ban user object',
      });
    }
  }

  private validateMakeAdmin(payload: any) {
    if (!('roomId' in payload && 'targetUserId' in payload)) {
      throw new WsException({
        error: EV_MAKE_ADMIN,
        message: 'Invalid make admin object',
      });
    }
    if (
      typeof payload.roomId !== 'string' ||
      typeof payload.targetUserId !== 'string'
    ) {
      throw new WsException({
        error: EV_MAKE_ADMIN,
        message: 'Invalid make admin object',
      });
    }
  }

  private validateAddMember(payload: any) {
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

  private validateBlockUser(payload: any) {
    if (!('targetUserId' in payload)) {
      throw new WsException({
        error: EV_BLOCK_USER,
        message: 'Invalid block user object',
      });
    }
    if (typeof payload.targetUserId !== 'string') {
      throw new WsException({
        error: EV_BLOCK_USER,
        message: 'Invalid block user object',
      });
    }
  }
}
