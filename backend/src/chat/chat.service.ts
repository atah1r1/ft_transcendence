import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { User, Room, RoomUser, Message } from '@prisma/client';
import { Chat } from './models/chat.interface';
import bcrypt from 'bcrypt';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  // NOTE: userId -> [socketId]
  private connectedUsers: Map<string, string[]> = new Map();

  // NOTE: Replace with Prisma implementation.
  // chatProvider: ChatFakeProvider = new ChatFakeProvider();

  // Connected Users
  getConnectedUserById(userId: string): string[] {
    return this.connectedUsers.get(userId);
  }

  addConnectedUser(userId: string, socketId: string) {
    const socketIds = this.connectedUsers.get(userId);
    if (socketIds) {
      socketIds.push(socketId);
    } else {
      this.connectedUsers.set(userId, [socketId]);
    }
  }

  removeConnectedUser(userId: string, socketId: string) {
    const socketIds = this.connectedUsers.get(userId);
    if (!socketIds) return;
    const newSocketIds = socketIds.filter((id) => id !== socketId);
    if (newSocketIds.length === 0) {
      this.connectedUsers.delete(userId);
    } else {
      this.connectedUsers.set(userId, newSocketIds);
    }
  }


  // Rooms
  async createDm(userId: string, otherUserId: string): Promise<Room> {
    const _room = await this.prisma.room.create({
      data: {
        name: null,
        image: null,
        password: null,
        isPasswordRequired: false,
        isDm: true,
      }
    });

    this.addUserToRoom(userId, _room.id, null, true);
    this.addUserToRoom(otherUserId, _room.id, null, true);

    return _room;
  }

  async createRoom(creatorId: string, name: string, image: string, isPasswordRequired: boolean, password: string): Promise<Room> {

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
          },
        },
      },
    });

    return _rooms;
  }

  async encryptRoomPassword(password: string): Promise<string> {
    const _saltRounds = 10;
    const _hashed = await bcrypt.hash(password, _saltRounds);
    return _hashed;
  }

  async validateRoomPassword(password: string, hashed: string): Promise<boolean> {
    const _isValid = await bcrypt.compare(password, hashed);
    return _isValid;
  }

  // Rooms/RoomUsers
  private async addUserToRoom(userId: string, roomId: string, password?: string, isAdmin: boolean = false): Promise<RoomUser> {
    const _room = await this.prisma.room.findUnique({ where: { id: roomId } });
    if (!_room) throw new Error('Room does not exist');

    const _existingRoomUser: RoomUser = await this.getRoomUserByUserIdAndRoomId(userId, roomId);
    if (_existingRoomUser) throw new Error('User already in room');

    if (_room.isPasswordRequired && this.validateRoomPassword(password, _room.password))
      throw new Error('Incorrect room password');

    const _roomUser = await this.prisma.roomUser.create({
      data: {
        isAdmin: isAdmin,
        isBanned: false,
        hasRead: true,
        roomId: roomId,
        userId: userId,
      }
    });

    return _roomUser;
  }

  async addUserToRoomByAdmin(adminId: string, userToAddId: string, roomId: string, password?: string, isAdmin: boolean = false): Promise<RoomUser> {
    const _room = await this.prisma.room.findUnique({ where: { id: roomId } });
    if (!_room) throw new Error('Room does not exist');

    const _adminRoomUser: RoomUser = await this.getRoomUserByUserIdAndRoomId(adminId, roomId);
    if (!_adminRoomUser) throw new Error('User not in room');
    if (!_adminRoomUser.isAdmin) throw new Error('You are not an admin');

    const _existingRoomUser: RoomUser = await this.getRoomUserByUserIdAndRoomId(userToAddId, roomId);
    if (_existingRoomUser) throw new Error('User already in room');

    if (_room.isPasswordRequired && this.validateRoomPassword(password, _room.password))
      throw new Error('Incorrect room password');

    const _roomUser = await this.prisma.roomUser.create({
      data: {
        isAdmin: isAdmin,
        isBanned: false,
        hasRead: true,
        roomId: roomId,
        userId: userToAddId,
      }
    });

    return _roomUser;
  }

  async removeUserFromRoom(adminId: string, userToRemoveId: string, roomId: string): Promise<boolean> {
    const _room = await this.prisma.room.findUnique({ where: { id: roomId } });
    if (!_room) throw new Error('Room does not exist');

    const _adminRoomUser = await this.getRoomUserByUserIdAndRoomId(adminId, roomId);
    if (!_adminRoomUser) throw new Error('User not in room');
    if (!_adminRoomUser.isAdmin) throw new Error('You are not an admin');

    const _existingRoomUser: RoomUser = await this.getRoomUserByUserIdAndRoomId(userToRemoveId, roomId);
    if (!_existingRoomUser) throw new Error('User not in room');

    if (_room.isDm) throw new Error('Cannot leave DM');

    const _deletedRu = await this.prisma.roomUser.delete({
      where: {
        userId: userToRemoveId,
      }
    });

    return _deletedRu ? true : false;
  }

  async banUserFromRoom(adminId: string, bannedUserId: string, roomId: string, ban: boolean) {
    const _room = await this.prisma.room.findUnique({ where: { id: roomId } });
    if (!_room) throw new Error('Room does not exist');

    const _adminRoomUser = await this.getRoomUserByUserIdAndRoomId(adminId, roomId);
    if (!_adminRoomUser) throw new Error('You are not in room');
    if (!_adminRoomUser.isAdmin) throw new Error('You are not an admin');

    const _existingRoomUser: RoomUser = await this.getRoomUserByUserIdAndRoomId(bannedUserId, roomId);
    if (!_existingRoomUser) throw new Error('User not in room');

    if (!_adminRoomUser.isAdmin) throw new Error('You are not an admin');

    if (_existingRoomUser.isBanned === ban)
      throw new Error(`User is already${!ban ? ' not banned' : 'banned'}`);

    this.prisma.roomUser.update({
      where: {
        userId: bannedUserId,
      },
      data: {
        isBanned: ban,
      },
    });
  }

  async getRoomUsersByRoomId(roomId: string, includeUser?: boolean, includeRoom?: boolean): Promise<any[]> {
    const _roomUsers = await this.prisma.roomUser.findMany({
      where: {
        roomId: roomId,
      },
      include: {
        user: includeUser,
        room: includeRoom,
      }
    });
    return _roomUsers;
  }

  async getRoomUsersByUserId(userId: string, includeUser?: boolean, includeRoom?: boolean): Promise<any[]> {
    const _roomUsers = await this.prisma.roomUser.findMany({
      where: {
        userId: userId,
      },
      include: {
        user: includeUser,
        room: includeRoom,
      }
    });
    return _roomUsers;
  }

  async getRoomUserByUserIdAndRoomId(userId: string, roomId: string, includeUser?: boolean, includeRoom?: boolean): Promise<any> {
    const _roomUser = await this.prisma.roomUser.findUnique({
      where: {
        userId: userId,
        roomId: roomId,
      },
      include: {
        user: includeUser,
        room: includeRoom,
      }
    });
    return _roomUser;
  }

  // Chats
  async getChatsByUserId(userId: string): Promise<any[]> {
    const _rooms: Room[] = await this.getRoomsByUserId(userId);

    return _rooms.map(async (room) => {
      let _name: string = null;
      let _image: string = null;

      if (room.isDm) {
        const _roomUsers = await this.getRoomUsersByRoomId(room.id, true, false);
        _name = _roomUsers.find((ru) => ru.userId !== userId).user.username;
      }

      if (room.isDm) {
        const _roomUsers = await this.getRoomUsersByRoomId(room.id, true, false);
        _image = _roomUsers.find((ru) => ru.userId !== userId).user.avatar;
      }

      const _lastMessage: any = this.getLastMessageByRoomId(room.id);
      const _wasRead: boolean = (await this.getRoomUserByUserIdAndRoomId(userId, room.id)).hasRead;

      return {
        room: room,
        name: _name,
        image: _image,
        lastMessage: _lastMessage,
        wasRead: _wasRead,
      };
    });
  }

  async updateSeen(userId: string, roomId: string, seen: boolean) {
    await this.prisma.roomUser.update({
      where: {
        userId: userId,
        roomId: roomId,
      },
      data: {
        hasRead: seen,
      },
    });
  }

  // Messages
  async createMessage(roomUserId: string, roomId: string, message: string): Promise<Message> {
    const _message: Message = await this.prisma.message.create({
      data: {
        message: message,
        roomUserId: roomUserId,
        roomId: roomId,
      }
    });

    return _message;
  }

  async getMessagesByRoomId(roomId: string, includeRoomUser?: boolean, includeRoom?: boolean): Promise<any[]> {
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

  async getLastMessageByRoomId(roomId: string, includeRoomUser?: boolean, includeRoom?: boolean): Promise<any> {
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
