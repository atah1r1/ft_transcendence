import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { UserService } from 'src/user/user.service';

@Injectable()
export class GameService {
  constructor(private userService: UserService) {}

  connectedUsers = new Map<string, Socket[]>();

  // gameId => sockets (players and spectators)
  games = new Map<string, string[]>();

  // userId => socket
  players = new Map<string, Socket>();

  // userId => socket
  spectators = new Map<string, Socket>();

  // userId => userId
  requests = new Map<string, string>();

  getConnectedUsersIds(): string[] {
    return [...this.connectedUsers.keys()];
  }

  getConnectedUserById(userId: string): Socket[] {
    return this.connectedUsers.get(userId) ?? [];
  }

  getGameById(gameId: string): string[] {
    return this.games.get(gameId) ?? [];
  }

  getPlayerById(userId: string): Socket {
    return this.players.get(userId);
  }

  getSpectatorById(userId: string): Socket {
    return this.spectators.get(userId);
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

  addPlayer(userId: string, socket: Socket) {
    if (this.players.has(userId))
      throw new Error('You are already in a match.');
    if (this.spectators.has(userId))
      throw new Error('You are spectating a match.');
    this.players.set(userId, socket);
  }

  addSpectator(userId: string, socket: Socket) {
    if (this.spectators.has(userId))
      throw new Error('You are already spectating a match.');
    if (this.players.has(userId)) throw new Error('You are playing a match.');
    this.spectators.set(userId, socket);
  }

  addRequest(userId: string, opponentId: string) {
    if (this.requests.has(userId))
      throw new Error('You already have a pending request.');
    if (this.requests.has(opponentId))
      throw new Error('This user already has a pending request.');
    this.requests.set(userId, opponentId);
    this.requests.set(opponentId, userId);
  }

  removePlayer(userId: string) {
    this.players.delete(userId);
  }

  removeSpectator(userId: string) {
    this.spectators.delete(userId);
  }

  removeRequest(userId: string, opponentId: string) {
    this.requests.delete(userId);
    this.requests.delete(opponentId);
  }

  getPlayerIds(): string[] {
    return [...this.players.keys()];
  }

  getSpectatorIds(): string[] {
    return [...this.spectators.keys()];
  }

  async getPlayingFriends(userId: string): Promise<any[]> {
    const friends = await this.userService.getFriends(userId);
    if (!friends) return [];
    const players = friends.filter((friend) => this.players.has(friend.id));
    return players;
  }

  async getSpectatingFriends(userId: string): Promise<any[]> {
    const friends = await this.userService.getFriends(userId);
    if (!friends) return [];
    const players = friends.filter((friend) => this.spectators.has(friend.id));
    return players;
  }

  async playAgainst(userId: string, otherId: string): Promise<boolean> {
    if (userId === otherId)
      throw new Error('You cannot play against yourself.');
    const blocked = await this.userService.getBlockedUsers(userId);
    const blockedUsersIds = blocked.map((user) => user.id);
    if (blockedUsersIds.includes(otherId))
      throw new Error('You cannot play against this user.');
    if (this.players.has(userId))
      throw new Error('You are already in a match.');
    if (this.spectators.has(userId))
      throw new Error('You are spectating a match.');
    if (this.players.has(otherId))
      throw new Error('This user is already in a match.');
    if (this.spectators.has(otherId))
      throw new Error('This user is spectating a match.');
    if (this.requests.has(userId))
      throw new Error('You already have a pending request.');
    if (this.requests.has(otherId))
      throw new Error('This user already has a pending request.');
    this.addRequest(userId, otherId);
    return true;
  }

  async startGame(gameId: string) {
    // TODO: implement game logic
  }

  async acceptPlayAgainst(
    userId: string,
    otherId: string,
    userSocket: Socket,
  ): Promise<string> {
    if (userId === otherId)
      throw new Error('You cannot play against yourself.');
    if (this.players.has(userId))
      throw new Error('You are already in a match.');
    if (this.spectators.has(userId))
      throw new Error('You are spectating a match.');
    if (this.players.has(otherId))
      throw new Error('This user is already in a match.');
    if (this.spectators.has(otherId))
      throw new Error('This user is spectating a match.');
    if (!this.requests.has(userId))
      throw new Error('You do not have a pending request.');
    if (this.requests.get(userId) !== otherId)
      throw new Error('You do not have a pending request.');
    this.removeRequest(userId, otherId);
    this.addPlayer(userId, userSocket);
    this.addPlayer(otherId, this.connectedUsers.get(otherId)[0]);
    const gameId = `${userId}_${otherId}`;
    this.games.set(gameId, [userId, otherId]);
    await this.startGame(gameId);
    return gameId;
  }

  async declinePlayAgainst(userId: string, otherId: string) {
    if (userId === otherId)
      throw new Error('You cannot play against yourself.');
    if (this.players.has(userId))
      throw new Error('You are already in a match.');
    if (this.spectators.has(userId))
      throw new Error('You are spectating a match.');
    if (this.players.has(otherId))
      throw new Error('This user is already in a match.');
    if (this.spectators.has(otherId))
      throw new Error('This user is spectating a match.');
    if (!this.requests.has(userId))
      throw new Error('You do not have a pending request.');
    if (this.requests.get(userId) !== otherId)
      throw new Error('You do not have a pending request.');
    this.removeRequest(userId, otherId);
  }
}
