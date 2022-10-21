import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { RoomUser } from './models/room-user.interface';
import { Room } from './models/room.interface';
import { ChatFakeProvider } from './chat.fake-provider';
import { User } from '@prisma/client';
import { Chat } from './models/chat.interface';
import { Message } from './models/message.interface';

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
			hasRead: true,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		this.chatProvider.createRoomUser(_roomUser);
		room.members.push(_roomUser);
	}

	removeUserFromRoom(user: User, roomId: string) {
		const room: Room = this.chatProvider.getRoomByRoomId(roomId);
		if (!room)
			throw new Error('Room does not exist');

		const _existingRoomUser: RoomUser = this.chatProvider.getRoomUserByRoomIdAndUserId(roomId, user.id);
		if (!_existingRoomUser)
			throw new Error('User not in room');

		// NOTE: should be done by Prisma
		this.chatProvider.deleteRoomUser(_existingRoomUser);
		room.members = room.members.filter((ru) => ru.user.id !== user.id);
	}

	banUserFromRoom(userId: string, otherId: string, roomId: string, banned: boolean) {
		const room: Room = this.chatProvider.getRoomByRoomId(roomId);
		if (!room)
			throw new Error('Room does not exist');

		const _adminRoomUser: RoomUser = this.chatProvider.getRoomUserByRoomIdAndUserId(roomId, userId);
		const _existingRoomUser: RoomUser = this.chatProvider.getRoomUserByRoomIdAndUserId(roomId, otherId);
		if (!_adminRoomUser || !_existingRoomUser)
			throw new Error('User not in room');

		if (!_adminRoomUser.isAdmin)
			throw new Error('You are not an admin');

		if (_existingRoomUser.isBanned === banned)
			throw new Error(`User is already${!banned ? ' not banned' : 'banned'}`);

		this.chatProvider.updateRoomUser({ ..._existingRoomUser, isBanned: banned });
	}

	createDm(user: User, other: User): Room {
		const _room: Room = {
			id: `${this.chatProvider.roCounter++}`,
			roomId: `dm_${user.id}_${other.id}`,
			name: null,
			image: null,
			password: null,
			requiresPassword: false,
			isDm: true,
			members: [],
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		this.chatProvider.createRoom(_room);
		this.addUserToRoom(user, _room.id);
		this.addUserToRoom(other, _room.id);
		return _room;
	}

	createRoom(user: User, name: string, image: string, requiresPassword: boolean, password: string): Room {
		const _room: Room = {
			id: `${this.chatProvider.roCounter++}`,
			roomId: `room_${name}_${this.chatProvider.roCounter}`,
			name: name,
			image: image,
			requiresPassword: requiresPassword,
			password: password,
			isDm: false,
			members: [],
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		this.chatProvider.createRoom(_room);
		this.addUserToRoom(user, _room.id);
		return _room;
	}

	getRoomsByUserId(userId: string): Room[] {
		return this.chatProvider.getRoomsByUserId(userId);
	}

	// Chats
	getChatsByUserId(userId: string): Chat[] {
		const _rooms: Room[] = this.getRoomsByUserId(userId);

		return _rooms.map((room) => {
			const _name: string = room.isDm
				? room.members.find((ru) => ru.user.id !== userId).user.username
				: room.name;
			const _image: string = room.isDm
				? room.members.find((ru) => ru.user.id !== userId).user.avatar
				: room.image;
			const _lastMessage: Message = this.chatProvider.getLastMessageByRoomId(room.id);
			const _wasRead: boolean = this.chatProvider.getRoomUserByRoomIdAndUserId(room.id, userId).hasRead;

			return {
				room: room,
				name: _name,
				image: _image,
				lastMessage: _lastMessage,
				wasRead: _wasRead,
			};
		});
	}

	updateSeen(userId: string, roomId: string, seen: boolean) {
		const _roomUser: RoomUser = this.chatProvider.getRoomUserByRoomIdAndUserId(roomId, userId);
		this.chatProvider.updateRoomUser({ ..._roomUser, hasRead: seen });
	}

	// Messages
	getMessagesByRoomId(roomId: string): Message[] {
		return this.chatProvider.getMessagesByRoomId(roomId);
	}

	createMessage(user: User, roomId: string, message: string): Message {
		const _message: Message = {
			id: `${this.chatProvider.mesCounter++}`,
			room: this.chatProvider.getRoomByRoomId(roomId),
			roomUser: this.chatProvider.getRoomUserByRoomIdAndUserId(roomId, user.id),
			message: message,
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		this.chatProvider.createMessage(_message);
		return _message;
	}
}
