import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConnectdUser } from './models/connectd-user.interface';
import { Message } from './models/message.interface';
import { RoomUser } from './models/room-user.interface';
import { Room } from './models/room.interface';

@Injectable()
export class ChatService {
	constructor(private prisma: PrismaService, private jwt: JwtService) { }

	// NOTE: Temporary
	private ruCounter = 0;
	private mesCounter = 0;
	private roCounter = 0;

	// NOTE: userId -> [socketId]
	private connectedUsers: Map<number, string[]> = new Map();

	// NOTE: SHOULD BE SAVED IN DB
	private users: User[] = [];
	private messages: Message[] = [];
	private rooms: Room[] = [];
	private roomUsers: RoomUser[] = [];

	addConnectedUser(userId: number, socketId: string) {
		const socketIds = this.connectedUsers.get(userId);
		if (socketIds) {
			socketIds.push(socketId);
		} else {
			this.connectedUsers.set(userId, [socketId]);
		}
	}

	removeConnectedUser(userId: number, socketId: string) {
		const socketIds = this.connectedUsers.get(userId);
		if (!socketIds) return;
		const newSocketIds = socketIds.filter((id) => id !== socketId);
		if (newSocketIds.length === 0) {
			this.connectedUsers.delete(userId);
		} else {
			this.connectedUsers.set(userId, newSocketIds);
		}
	}

	// NOTE: Replace id: string with id: number
	// NOTE: Replace userId: string with user: User
	// NOTE: find user outside of this service using UserService
	// IMPORTANT: Replace with a DB save.
	addUserToRoom(userId: string, roomId: string, password?: string) {
		const room: Room = this.rooms.find((r) => r.roomId === roomId);
		if (!room) throw new Error('Room does not exist');

		if (!room.requiresPassword && room.password !== password)
			throw new Error('Incorrect room password');

		const roomUser: RoomUser = {
			id: this.ruCounter++,
			roomId: roomId,
			user: this.users.filter((user) => user.id === userId)[0],
			isAdmin: false,
			createdAt: new Date(),
			updatedAt: new Date(),
		}

		this.roomUsers.push(roomUser);
	}
}
