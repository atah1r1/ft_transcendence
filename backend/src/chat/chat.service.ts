import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { Message } from './models/message.interface';
import { RoomUser } from './models/room-user.interface';
import { Room } from './models/room.interface';
import { Socket } from 'socket.io';

@Injectable()
export class ChatService {
	constructor(private prisma: PrismaService, private jwt: JwtService) { }

	// NOTE: Temporary
	private ruCounter = 0;
	private mesCounter = 0;
	private roCounter = 0;

	// NOTE: userId -> [socketId]
	private connectedUsers: Map<string, string[]> = new Map();

	// NOTE: SHOULD BE SAVED IN DB
	private users: User[] = [];
	private messages: Message[] = [];
	private rooms: Room[] = [];
	private roomUsers: RoomUser[] = [];

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

	// NOTE: move this chat.gateway.ts
	// - this service should not be responsible for socket.io
	connectUserToJoinedRooms(userId: string, socket: Socket) {
		// NOTE: we assume User has list of roomUser objects
		// NOTE: For now we simulate this by filtering roomUsers
		// this should be done by Prisma
		const _roomUsers: RoomUser[] = this.roomUsers.filter((ru) => ru.user.id === userId);
		_roomUsers.forEach((ru) => {
			socket.join(ru.room.roomId);
		});
	}

	// NOTE: Replace id: string with id: number
	// NOTE: Replace userId: string with user: User
	// NOTE: find user outside of this service using UserService
	// IMPORTANT: Replace with a DB save.
	addUserToRoom(userId: string, roomId: string, password?: string) {
		const room: Room = this.rooms.find((r) => r.roomId === roomId);
		if (!room) throw new Error('Room does not exist');

		const _existingRoomUser: RoomUser = room.members.find((ru) => ru.user.id === userId);
		if (_existingRoomUser) throw new Error('User already in room');

		if (!room.requiresPassword && room.password !== password)
			throw new Error('Incorrect room password');

		// NOTE: should be done by Prisma
		const roomUser: RoomUser = {
			id: this.ruCounter++,
			room: room,
			user: this.users.filter((user) => user.id === userId)[0],
			isAdmin: false,
			isBanned: false,
			createdAt: new Date(),
			updatedAt: new Date(),
		}
		this.roomUsers.push(roomUser);
	}
}
