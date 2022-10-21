import { User } from '@prisma/client';
import { Message } from './models/message.interface';
import { RoomUser } from './models/room-user.interface';
import { Room } from './models/room.interface';

export class ChatFakeProvider {
  // NOTE: Temporary
  ruCounter = 0;
  mesCounter = 0;
  roCounter = 0;

  // NOTE: SHOULD BE SAVED IN DB
  users: User[] = [];
  messages: Message[] = [];
  rooms: Room[] = [];
  roomUsers: RoomUser[] = [];

  // CREATE
  createMessage(message: Message) {
    this.messages.push(message);
  }

  createRoom(room: Room) {
    this.rooms.push(room);
  }

  createRoomUser(roomUser: RoomUser) {
    this.roomUsers.push(roomUser);
  }

  createUser(user: User) {
    this.users.push(user);
  }

  // READ
  getMessagesByRoomId(roomId: string): Message[] {
    return this.messages.filter((m) => m.room.id === roomId);
  }

  getRoomMembersByRoomId(roomId: string): RoomUser[] {
    return this.roomUsers.filter((ru) => ru.room.id === roomId);
  }

  getRoomUsersByUserId(userId: string): RoomUser[] {
    return this.roomUsers.filter((ru) => ru.user.id === userId);
  }

  getRoomUserByRoomIdAndUserId(roomId: string, userId: string): RoomUser {
    return this.roomUsers.find(
      (ru) => ru.room.id === roomId && ru.user.id === userId,
    );
  }

  getRoomByRoomId(roomId: string): Room {
    return this.rooms.find((r) => r.id === roomId);
  }

  getRoomsByUserId(userId: string): Room[] {
    const roomUsers = this.getRoomUsersByUserId(userId);
    return roomUsers.map((ru) => ru.room);
  }

  getUserById(userId: string): User {
    return this.users.find((u) => u.id === userId);
  }

  // UPDATE
  updateMessage(message: Message) {
    const index = this.messages.findIndex((m) => m.id === message.id);
    this.messages[index] = message;
  }

  updateRoom(room: Room) {
    const index = this.rooms.findIndex((r) => r.roomId === room.roomId);
    this.rooms[index] = room;
  }

  updateRoomUser(roomUser: RoomUser) {
    const index = this.roomUsers.findIndex((ru) => ru.id === roomUser.id);
    this.roomUsers[index] = roomUser;
  }

  updateUser(user: User) {
    const index = this.users.findIndex((u) => u.id === user.id);
    this.users[index] = user;
  }

  // DELETE
  deleteMessage(message: Message) {
    const index = this.messages.findIndex((m) => m.id === message.id);
    this.messages.splice(index, 1);
  }

  deleteRoom(room: Room) {
    const index = this.rooms.findIndex((r) => r.roomId === room.roomId);
    this.rooms.splice(index, 1);
  }

  deleteRoomUser(roomUser: RoomUser) {
    const index = this.roomUsers.findIndex((ru) => ru.id === roomUser.id);
    this.roomUsers.splice(index, 1);
  }

  deleteUser(user: User) {
    const index = this.users.findIndex((u) => u.id === user.id);
    this.users.splice(index, 1);
  }
}
