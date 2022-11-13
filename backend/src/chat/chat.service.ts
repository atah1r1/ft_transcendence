import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Room, RoomUser, Message, RoomPrivacy, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { Socket } from 'socket.io';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
  ) {}

  // NOTE: userId -> [socketId]
  connectedUsers: Map<string, Socket[]> = new Map();

  // Connected Users
  getConnectedUsersIds(): string[] {
    return [...this.connectedUsers.keys()];
  }

  async getConnectedFriends(userId: string): Promise<any[]> {
    const friends = await this.userService.getFriends(userId);
    console.log('Friends: ', friends);
    const connectedUsers = friends.filter((friend) =>
      this.connectedUsers.has(friend.id),
    );
    return connectedUsers;
  }

  getConnectedUserById(userId: string): Socket[] {
    return this.connectedUsers.get(userId);
  }

  addConnectedUser(userId: string, socket: Socket) {
    const sockets = this.connectedUsers.get(userId);
    if (sockets) {
      sockets.push(socket);
    } else {
      this.connectedUsers.set(userId, [socket]);
    }
  }

  removeConnectedUser(userId: string, socket: Socket) {
    const sockets = this.connectedUsers.get(userId);
    if (!sockets) return;
    const newSockets = sockets.filter((s) => s.id !== socket.id);
    if (newSockets.length === 0) {
      this.connectedUsers.delete(userId);
    } else {
      this.connectedUsers.set(userId, newSockets);
    }
  }

  // Rooms
  async createDm(userId: string, otherUserId: string): Promise<any> {
    const _existingDm = await this.getDmByUserIds(userId, otherUserId);
    if (_existingDm) return this.formatChat(userId, _existingDm, true);

    const otherUser = await this.userService.getUserById(otherUserId);
    if (!otherUser) throw new Error('Other User does not exist');

    const _room = await this.prisma.room.create({
      data: {
        name: null,
        image: null,
        password: null,
        privacy: 'PRIVATE',
        isDm: true,
      },
    });

    await this.addUserToRoom(userId, _room.id, null, true);
    await this.addUserToRoom(otherUserId, _room.id, null, true);
    await this.userService.addFriend(userId, otherUserId);
    const _updatedRoom = await this.getRoomById(_room.id, true);

    return await this.formatChat(userId, _updatedRoom, false);
  }

  async createRoom(
    creatorId: string,
    name: string,
    image: string,
    privacy: RoomPrivacy,
    password: string,
  ): Promise<any> {
    let _hashed: string = null;

    if (privacy === 'PROTECTED') {
      _hashed = await this.encryptRoomPassword(password);
    }

    const _room = await this.prisma.room.create({
      data: {
        name: name,
        image: image,
        privacy: privacy,
        password: _hashed,
        isDm: false,
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    await this.addUserToRoom(creatorId, _room.id, password, true);

    return await this.formatChat(creatorId, _room, false);
  }

  async getRoomsByUserId(
    userId: string,
    includeUsers = false,
  ): Promise<Room[]> {
    const _rooms = await this.prisma.room.findMany({
      where: {
        members: {
          some: {
            userId: userId,
            isBanned: false,
          },
        },
      },
      include: {
        members: {
          include: {
            user: includeUsers,
          },
        },
      },
    });

    return _rooms;
  }

  async getRoomById(roomId: string, includeMembers = false): Promise<Room> {
    const _room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        members: {
          include: {
            user: includeMembers,
          },
        },
      },
    });
    return _room;
  }

  async getDmByUserIds(userId: string, otherUserId: string): Promise<Room> {
    const _room = await this.prisma.room.findFirst({
      where: {
        isDm: true,
        members: {
          every: {
            userId: {
              in: [userId, otherUserId],
            },
          },
        },
      },
    });

    return _room;
  }

  private async encryptRoomPassword(password: string): Promise<string> {
    const _saltRounds = 10;
    const _hashed = await bcrypt.hash(password, _saltRounds);
    return _hashed;
  }

  private async validateRoomPassword(
    password: string,
    hashed: string,
  ): Promise<boolean> {
    const _isValid = await bcrypt.compare(password, hashed);
    return _isValid;
  }

  // Rooms/RoomUsers
  async addUserToRoom(
    userToAddId: string,
    roomId: string,
    password?: string,
    isAdmin = false,
  ): Promise<RoomUser> {
    const _room = await this.prisma.room.findUnique({ where: { id: roomId } });
    if (!_room) throw new Error('Room does not exist');

    const _existingRoomUser: RoomUser = await this.getRoomUserByUserIdAndRoomId(
      userToAddId,
      roomId,
    );
    if (_existingRoomUser) throw new Error('User already in room');

    if (
      _room.privacy === 'PROTECTED' &&
      !(await this.validateRoomPassword(password, _room.password))
    )
      throw new Error('Incorrect room password');

    const _roomUser = await this.prisma.roomUser.create({
      data: {
        isAdmin: isAdmin,
        isBanned: false,
        hasRead: true,
        roomId: roomId,
        userId: userToAddId,
      },
    });

    return _roomUser;
  }

  async addUserToRoomByAdmin(
    adminId: string,
    userToAddId: string,
    roomId: string,
  ): Promise<RoomUser> {
    const _room = await this.prisma.room.findUnique({ where: { id: roomId } });
    if (!_room) throw new Error('Room does not exist');
    if (_room.isDm) throw new Error('Room is a DM');

    const _adminRoomUser: RoomUser = await this.getRoomUserByUserIdAndRoomId(
      adminId,
      roomId,
    );
    if (!_adminRoomUser) throw new Error('User not in room');
    if (!_adminRoomUser.isAdmin) throw new Error('You are not an admin');

    const _existingRoomUser: RoomUser = await this.getRoomUserByUserIdAndRoomId(
      userToAddId,
      roomId,
    );
    if (_existingRoomUser) throw new Error('User already in room');

    // if (
    //   _room.isPasswordRequired &&
    //   this.validateRoomPassword(password, _room.password)
    // )
    //   throw new Error('Incorrect room password');

    const _roomUser = await this.prisma.roomUser.create({
      data: {
        isAdmin: false,
        isBanned: false,
        hasRead: false,
        roomId: roomId,
        userId: userToAddId,
      },
    });

    return _roomUser;
  }

  async removeUserFromRoom(
    userToRemoveId: string,
    roomId: string,
  ): Promise<RoomUser> {
    const _room = await this.prisma.room.findUnique({ where: { id: roomId } });
    if (!_room) throw new Error('Room does not exist');

    const _existingRoomUser: RoomUser = await this.getRoomUserByUserIdAndRoomId(
      userToRemoveId,
      roomId,
    );
    if (!_existingRoomUser) throw new Error('User not in room');

    if (_room.isDm) throw new Error('Cannot leave DM');

    const _deletedRu = await this.prisma.roomUser.delete({
      where: {
        id: _existingRoomUser.id,
      },
    });

    return _deletedRu;
  }

  async removeUserFromRoomByAdmin(
    adminId: string,
    userToRemoveId: string,
    roomId: string,
  ): Promise<boolean> {
    const _room = await this.prisma.room.findUnique({ where: { id: roomId } });
    if (!_room) throw new Error('Room does not exist');

    const _adminRoomUser = await this.getRoomUserByUserIdAndRoomId(
      adminId,
      roomId,
    );
    if (!_adminRoomUser) throw new Error('User not in room');
    if (!_adminRoomUser.isAdmin) throw new Error('You are not an admin');

    const _existingRoomUser: RoomUser = await this.getRoomUserByUserIdAndRoomId(
      userToRemoveId,
      roomId,
    );
    if (!_existingRoomUser) throw new Error('User not in room');

    if (_room.isDm) throw new Error('Cannot leave DM');

    const _deletedRu = await this.prisma.roomUser.delete({
      where: {
        id: _existingRoomUser.id,
      },
    });

    return _deletedRu ? true : false;
  }

  async banUserFromRoom(
    adminId: string,
    bannedUserId: string,
    roomId: string,
    ban: boolean,
  ): Promise<RoomUser> {
    const _room = await this.prisma.room.findUnique({ where: { id: roomId } });
    if (!_room) throw new Error('Room does not exist');

    const _adminRoomUser = await this.getRoomUserByUserIdAndRoomId(
      adminId,
      roomId,
    );
    if (!_adminRoomUser) throw new Error('You are not in room');
    if (!_adminRoomUser.isAdmin) throw new Error('You are not an admin');

    const _existingRoomUser: RoomUser = await this.getRoomUserByUserIdAndRoomId(
      bannedUserId,
      roomId,
    );
    if (!_existingRoomUser) throw new Error('User not in room');
    if (_existingRoomUser.isBanned === ban)
      throw new Error(`User is already${!ban ? ' not banned' : 'banned'}`);

    const ru = await this.prisma.roomUser.update({
      where: {
        id: _existingRoomUser.id,
      },
      data: {
        isBanned: ban,
      },
    });

    return ru;
  }

  async getRoomUsersByRoomId(
    roomId: string,
    includeUser = false,
    includeRoom = false,
  ): Promise<any[]> {
    const _roomUsers = await this.prisma.roomUser.findMany({
      where: {
        roomId: roomId,
      },
      include: {
        user: includeUser,
        room: includeRoom,
      },
    });
    return _roomUsers;
  }

  async getRoomUsersByUserId(
    userId: string,
    includeUser = false,
    includeRoom = false,
  ): Promise<any[]> {
    const _roomUsers = await this.prisma.roomUser.findMany({
      where: {
        userId: userId,
      },
      include: {
        user: includeUser,
        room: includeRoom,
      },
    });
    return _roomUsers;
  }

  async getRoomUserByUserIdAndRoomId(
    userId: string,
    roomId: string,
    includeUser = false,
    includeRoom = false,
  ): Promise<any> {
    const _roomUser = await this.prisma.roomUser.findFirst({
      where: {
        userId: userId,
        roomId: roomId,
      },
      include: {
        user: includeUser,
        room: includeRoom,
      },
    });
    return _roomUser;
  }

  async findRoomByName(userId: string, name: string): Promise<Room> {
    const _room = await this.prisma.room.findFirst({
      where: {
        isDm: false,
        name: {
          contains: name,
        },
        NOT: {
          privacy: 'PRIVATE',
          members: {
            some: {
              userId: userId,
            },
          },
        },
      },
    });
    return _room;
  }

  async getRooms(userId: string): Promise<Room[]> {
    const _rooms = await this.prisma.room.findMany({
      where: {
        isDm: false,
        NOT: {
          privacy: 'PRIVATE',
          members: {
            some: {
              userId: userId,
            },
          },
        },
      },
    });
    return _rooms;
  }

  async formatChat(userId: string, room: any, existing: boolean): Promise<any> {
    let _name: string = null;
    let _image: string = null;
    const _members: User[] = room.members.map((ru) => {
      delete ru.user.two_factor_auth;
      delete ru.user.two_factor_auth_uri;
      delete ru.user.two_factor_auth_key;
      return ru.user;
    });

    if (room.isDm) {
      _name = _members.find((member: User) => member.id !== userId).username;
      _image = _members.find((member: User) => member.id !== userId).avatar;
    } else {
      _name = room.name;
      _image = room.image;
    }

    const _lastMessage: any = await this.getLastMessageByRoomId(room.id);
    const _wasRead: boolean = (
      await this.getRoomUserByUserIdAndRoomId(userId, room.id)
    ).hasRead;

    return {
      roomId: room.id,
      name: _name,
      image: _image,
      updatedAt: room.updatedAt,
      lastMessage: _lastMessage,
      isDm: room.isDm,
      wasRead: _wasRead,
      existing: existing,
      members: _members,
    };
  }

  // Chats
  async getChatsByUserId(userId: string): Promise<any[]> {
    const _rooms: Room[] = await this.getRoomsByUserId(userId, true);

    console.log('NUM ROOMS', _rooms.length);

    const _chats = _rooms.map(async (room) => {
      return await this.formatChat(userId, room, true);
    });

    const _sortedChats = (await Promise.all(_chats)).sort((a, b) => {
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });
    return _sortedChats;
  }

  async updateSeen(userId: string, roomId: string, seen: boolean) {
    const _existingRoomUser: RoomUser = await this.getRoomUserByUserIdAndRoomId(
      userId,
      roomId,
    );
    if (!_existingRoomUser) throw new Error('User not in room');

    await this.prisma.roomUser.update({
      where: {
        id: _existingRoomUser.id,
      },
      data: {
        hasRead: seen,
      },
    });
  }

  async updateSeenInRoom(userId: string, roomId: string, seen: boolean) {
    const members = await this.getRoomUsersByRoomId(roomId);
    members.forEach(async (member) => {
      if (member.userId !== userId) {
        await this.prisma.roomUser.update({
          where: {
            id: member.id,
          },
          data: {
            hasRead: seen,
          },
        });
      }
    });
  }

  // Messages
  async createMessage(
    userId: string,
    roomId: string,
    message: string,
  ): Promise<Message> {
    const _room = await this.getRoomById(roomId);
    if (!_room) throw new Error('Room not found');

    const _roomUser = await this.getRoomUserByUserIdAndRoomId(userId, roomId);
    if (!_roomUser) throw new Error('User not in room');

    if (_roomUser.isBanned) throw new Error('User is banned');

    const _message: Message = await this.prisma.message.create({
      data: {
        message: message,
        roomUserId: _roomUser.id,
        roomId: roomId,
      },
      include: {
        roomUser: {
          include: {
            user: true,
          },
        },
        room: true,
      },
    });

    if (_message) {
      await this.prisma.room.update({
        where: {
          id: roomId,
        },
        data: {
          updatedAt: new Date(),
        },
      });
    }

    return this.formatMessage(_message);
  }

  async getMessagesByRoomId(
    userId: string,
    roomId: string,
    includeUser = false,
    includeRoom = false,
  ): Promise<any[]> {
    const room = await this.getRoomById(roomId);
    if (!room) throw new Error('Room does not exist');

    const _roomUser = await this.getRoomUserByUserIdAndRoomId(userId, roomId);
    if (!_roomUser) throw new Error('You are not in room');

    if (_roomUser.isBanned) throw new Error('User is banned');

    return await this.prisma.message.findMany({
      where: {
        roomId: roomId,
      },
      include: {
        roomUser: {
          include: {
            user: includeUser,
          },
        },
        room: includeRoom,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  formatMessage(message: any): any {
    return {
      id: message.id,
      message: message.message,
      createdAt: message.createdAt,
      roomId: message.roomId,
      roomName: message.room.name,
      user: {
        id: message.roomUser.user.id,
        username: message.roomUser.user.username,
        avatar: message.roomUser.user.avatar,
      },
    };
  }

  async getMessagesByRoomIdFormatted(userId: string, roomId: string) {
    const _messages = await this.getMessagesByRoomId(
      userId,
      roomId,
      true,
      true,
    );
    const _formattedMessages = _messages.map((message) => {
      return this.formatMessage(message);
    });
    return _formattedMessages;
  }

  private async getLastMessageByRoomId(
    roomId: string,
    includeRoomUser = false,
    includeRoom = false,
  ): Promise<any> {
    return await this.prisma.message.findFirst({
      where: {
        roomId: roomId,
      },
      include: {
        roomUser: includeRoomUser,
        room: includeRoom,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
