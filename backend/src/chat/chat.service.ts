import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Room, RoomUser, Message } from '@prisma/client';
import bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { Socket } from 'socket.io';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
  ) {}

  // NOTE: userId -> [socketId]
  private connectedUsers: Map<string, Socket[]> = new Map();

  // Connected Users
  getConnectedUsersIds(): string[] {
    return [...this.connectedUsers.keys()];
  }

  async getConnectedFriends(userId: string): Promise<any[]> {
    const friends = await this.userService.getFriends(userId);
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
  async createDm(userId: string, otherUserId: string): Promise<Room> {
    const _existingDm = await this.getDmByUserIds(userId, otherUserId);
    if (_existingDm) throw new Error('DM already exists');

    const otherUser = await this.userService.getUserById(otherUserId);
    if (!otherUser) throw new Error('Other User does not exist');

    const _room = await this.prisma.room.create({
      data: {
        name: null,
        image: null,
        password: null,
        isPasswordRequired: false,
        isDm: true,
      },
    });

    this.addUserToRoom(userId, _room.id, null, true);
    this.addUserToRoom(otherUserId, _room.id, null, true);

    return _room;
  }

  async createRoom(
    creatorId: string,
    name: string,
    image: string,
    isPasswordRequired: boolean,
    password: string,
  ): Promise<Room> {
    let _hashed: string = null;

    if (isPasswordRequired) {
      _hashed = await this.encryptRoomPassword(password);
    }

    const _room = await this.prisma.room.create({
      data: {
        name: name,
        image: image,
        isPasswordRequired: isPasswordRequired,
        password: _hashed,
        isDm: false,
      },
    });

    this.addUserToRoom(creatorId, _room.id, password, true);

    return _room;
  }

  async getRoomsByUserId(userId: string): Promise<Room[]> {
    const _rooms = await this.prisma.room.findMany({
      where: {
        members: {
          some: {
            userId: userId,
            isBanned: false,
          },
        },
      },
    });

    return _rooms;
  }

  async getRoomById(roomId: string, includeMembers = false): Promise<Room> {
    const _room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: { members: includeMembers },
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
      _room.isPasswordRequired &&
      this.validateRoomPassword(password, _room.password)
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
  ): Promise<boolean> {
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

    return _deletedRu ? true : false;
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
  ) {
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

    this.prisma.roomUser.update({
      where: {
        id: _existingRoomUser.id,
      },
      data: {
        isBanned: ban,
      },
    });
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

  // Chats
  async getChatsByUserId(userId: string): Promise<any[]> {
    const _rooms: Room[] = await this.getRoomsByUserId(userId);

    const _chats = _rooms.map(async (room) => {
      let _name: string = null;
      let _image: string = null;

      if (room.isDm) {
        const _roomUsers = await this.getRoomUsersByRoomId(
          room.id,
          true,
          false,
        );
        _name = _roomUsers.find((ru) => ru.userId !== userId).user.username;
        _image = _roomUsers.find((ru) => ru.userId !== userId).user.avatar;
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
        lastMessage: _lastMessage,
        wasRead: _wasRead,
      };
    });

    const _sortedChats = (await Promise.all(_chats)).sort(
      (a, b) => b.lastMessage.createdAt - a.lastMessage.createdAt,
    );
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
    });

    return _message;
  }

  async getMessagesByRoomId(
    userId: string,
    roomId: string,
    includeRoomUser = false,
    includeRoom = false,
  ): Promise<any[]> {
    const room = await this.getRoomById(roomId);
    if (!room) throw new Error('Room does not exist');

    const _roomUser = await this.getRoomUserByUserIdAndRoomId(userId, roomId);
    if (!_roomUser) throw new Error('You are not in room');

    return await this.prisma.message.findMany({
      where: {
        roomId: roomId,
      },
      include: {
        roomUser: includeRoomUser,
        room: includeRoom,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async getMessagesByRoomIdFormatted(userId: string, roomId: string) {
    const _messages = await this.getMessagesByRoomId(
      userId,
      roomId,
      true,
      false,
    );
    const _formattedMessages = _messages.map((message) => {
      return {
        id: message.id,
        message: message.message,
        createdAt: message.createdAt,
        user: {
          id: message.roomUser.user.id,
          username: message.roomUser.user.username,
          avatar: message.roomUser.user.avatar,
        },
      };
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
