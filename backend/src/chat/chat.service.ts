import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { RoomUser } from './models/room-user.interface';
import { Room } from './models/room.interface';
import { ChatFakeProvider } from './chat.fake-provider';
import { User } from '@prisma/client';

@Injectable()
export class ChatService {
	constructor(private prisma: PrismaService, private jwt: JwtService) { }

	// NOTE: userId -> [socketId]
	private connectedUsers: Map<string, string[]> = new Map();

	// NOTE: Replace with Prisma implementation.
	chatProvider: ChatFakeProvider = new ChatFakeProvider();

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

	// Rooms/RoomUsers
	addUserToRoom(user: User, roomId: string, password?: string) {
		const room: Room = this.chatProvider.getRoomByRoomId(roomId);
		if (!room) throw new Error('Room does not exist');

		const _existingRoomUser: RoomUser = room.members.find((ru) => ru.user.id === user.id);
		if (_existingRoomUser) throw new Error('User already in room');

		if (!room.requiresPassword && room.password !== password)
			throw new Error('Incorrect room password');

		// NOTE: should be done by Prisma
		const _roomUser: RoomUser = {
			id: `${this.chatProvider.ruCounter++}`,
			room: room,
			user: user,
			isAdmin: false,
			isBanned: false,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		this.chatProvider.createRoomUser(_roomUser);
		room.members.push(_roomUser);

	}

	removeUserFromRoom(user: User, roomId: string) {
		const room: Room = this.chatProvider.getRoomByRoomId(roomId);
		if (!room) throw new Error('Room does not exist');

		const _existingRoomUser: RoomUser = this.chatProvider.getRoomUserByRoomIdAndUserId(roomId, user.id);
		if (!_existingRoomUser) throw new Error('User not in room');

		// NOTE: should be done by Prisma
		this.chatProvider.deleteRoomUser(_existingRoomUser);
		room.members = room.members.filter((ru) => ru.user.id !== user.id);
	}
}
