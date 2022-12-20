import { Injectable } from '@nestjs/common';
import { GameHistory } from '@prisma/client';
import { Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import Queue from 'src/utils/queue';
import Game, { GameStatus, PlayerStatus } from './models/game.model';

const EV_EMIT_GAME_DATA = 'emit_game_data';

@Injectable()
export class GameService {
  constructor(
    private userService: UserService,
    private prisma: PrismaService,
  ) {}

  connectedUsers = new Map<string, Socket[]>();

  // gameId => sockets (players and spectators)
  games = new Map<string, Game>();

  // userId => socket
  players = new Map<string, Socket>();

  // userId => socket
  spectators = new Map<string, Socket>();

  // userId => userId
  requests = new Map<string, string>();

  gameQueue = new Queue<string>();

  getConnectedUsersIds(): string[] {
    return [...this.connectedUsers.keys()];
  }

  getConnectedUserById(userId: string): Socket[] {
    return this.connectedUsers.get(userId) ?? [];
  }

  getGameById(gameId: string): Game {
    return this.games.get(gameId);
  }

  getGameByUserIds(userId: string, otherId: string): Game {
    const game = [...this.games.values()].find((game) => {
      return game.players.includes(userId) && game.players.includes(otherId);
    });
    return game;
  }

  getGameByUserId(userId: string): Game {
    const game = [...this.games.values()].find((game) => {
      return game.players.includes(userId);
    });
    return game;
  }

  async getCurrentFriendsGames(userId: string): Promise<Game[]> {
    const friends = await this.userService.getFriends(userId);
    const friendsIds = friends.map((friend) => friend.id);
    const games = [...this.games.values()].filter((game) => {
      return (
        game.status === GameStatus.STARTED &&
        game.players.some((player) => friendsIds.includes(player))
      );
    });
    return games;
  }

  getCurrentGames(): Game[] {
    return [...this.games.values()].filter((game) => {
      return game.status === GameStatus.STARTED;
    });
  }

  getPlayerById(userId: string): Socket {
    return this.players.get(userId);
  }

  getSpectatorById(userId: string): Socket {
    return this.spectators.get(userId);
  }

  // Unsafe method.
  addConnectedUser(userId: string, socket: Socket) {
    const sockets = this.connectedUsers.get(userId);
    if (sockets) {
      sockets.push(socket);
    } else {
      this.connectedUsers.set(userId, [socket]);
    }
  }

  // Unsafe method.
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

  // Unsafe method.
  addPlayer(userId: string, socket: Socket) {
    // if (this.players.has(userId))
    //   throw new Error('You are already in a match.');
    // if (this.spectators.has(userId))
    //   throw new Error('You are spectating a match.');
    this.players.set(userId, socket);
  }

  // Unsafe method.
  addSpectator(userId: string, socket: Socket) {
    // if (this.spectators.has(userId))
    //   throw new Error('You are already spectating a match.');
    // if (this.players.has(userId)) throw new Error('You are playing a match.');
    this.spectators.set(userId, socket);
  }

  // Unsafe method.
  addRequest(userId: string, opponentId: string) {
    // if (this.requests.has(userId))
    //   throw new Error('You already have a pending request.');
    // if (this.requests.has(opponentId))
    //   throw new Error('This user already has a pending request.');
    this.requests.set(userId, opponentId);
    this.requests.set(opponentId, userId);
  }

  // Unsafe method.
  addToQueue(userId: string) {
    this.gameQueue.push(userId);
  }

  // Creates a new game in the ACCEPTED state.
  createNewGame(userId: string, opponentId: string): Game {
    const newGame = new Game();
    const gameId = `${userId}_${opponentId}_${Date.now()}`;
    newGame.id = gameId;
    newGame.players = [userId, opponentId];
    newGame.spectators = [];
    const newScore = new Map();
    newScore.set(userId, 0);
    newScore.set(opponentId, 0);
    newGame.score = newScore;
    newGame.status = GameStatus.ACCEPTED;
    const newPlayerStatus = new Map();
    newPlayerStatus.set(userId, PlayerStatus.PENDING);
    newPlayerStatus.set(opponentId, PlayerStatus.PENDING);
    newGame.playerStatus = newPlayerStatus;
    return newGame;
  }

  // Unsafe method.
  // remove player from players map
  removePlayer(userId: string) {
    this.players.delete(userId);
  }

  // Unsafe method.
  // remove spectator from spectators map
  removeSpectator(userId: string) {
    this.spectators.delete(userId);
  }

  // Unsafe method.
  // remove request from requests map
  removeRequest(userId: string, opponentId: string) {
    this.requests.delete(userId);
    this.requests.delete(opponentId);
  }

  removeRequestByUserId(userId: string) {
    const opponentId = this.requests.get(userId);
    this.requests.delete(userId);
    if (opponentId) this.requests.delete(opponentId);
  }

  // remove players/spectators from players/spectators maps
  // NB: doesn't remove from game object, because game object itself is removed
  // after being saved in database as game history.
  removeGameMembers(game: Game) {
    game.players.forEach((pId) => {
      this.removePlayer(pId);
    });
    game.spectators.forEach((sId) => {
      this.removeSpectator(sId);
    });
  }

  // Get all player userIds
  getPlayerIds(): string[] {
    return [...this.players.keys()];
  }

  // Get all spectator userIds
  getSpectatorIds(): string[] {
    return [...this.spectators.keys()];
  }

  // Get list of friends (User) that are playing a game
  async getPlayingFriends(userId: string): Promise<any[]> {
    const friends = await this.userService.getFriends(userId);
    if (!friends) return [];
    const players = friends.filter((friend) => this.players.has(friend.id));
    return players;
  }

  // Get list of friends (User) that are spectating a game
  async getSpectatingFriends(userId: string): Promise<any[]> {
    const friends = await this.userService.getFriends(userId);
    if (!friends) return [];
    const players = friends.filter((friend) => this.spectators.has(friend.id));
    return players;
  }

  // Join the auto-match queue
  // If you can play with player before you (not blocked)
  // the game will be created, next, both players need to send startGame event
  // to start the game
  // Otherwise you will be pushed to the queue and wait until someone joins
  // In both cases you recieve a game object with status ACCEPTED or QUEUED
  // respectively, so either show a waiting screen or start the game.
  async playInQueue(userId: string, socket: Socket): Promise<Game> {
    if (this.players.has(userId))
      throw new Error('You are already in a match.');
    if (this.spectators.has(userId))
      throw new Error('You are spectating a match.');
    if (this.requests.has(userId))
      throw new Error('You already have a pending request.');
    if (this.gameQueue.contains(userId))
      throw new Error('You are already in the queue.');
    if (!this.gameQueue.isEmpty()) {
      const otherId = this.gameQueue.peek();
      const blocked = await this.userService.getBlockedUsers(userId);
      const blockedUsersIds = blocked.map((user) => user.id);
      if (
        !blockedUsersIds.includes(otherId) &&
        this.connectedUsers.has(otherId)
      ) {
        const opId = this.gameQueue.pop();
        this.addPlayer(userId, socket);
        this.addPlayer(otherId, this.connectedUsers.get(opId)[0]);
        const newGame = this.createNewGame(userId, opId);
        return newGame;
      }
    }
    this.addToQueue(userId);
    const queuedGame = new Game();
    queuedGame.status = GameStatus.QUEUED;
    queuedGame.players = [userId];
    return queuedGame;
  }

  // Leave the auto-match queue
  // Should be called when the user cancels/leaves the waiting screen
  // It will be automatically called on disconnect
  async leaveQueue(userId: string): Promise<boolean> {
    return this.gameQueue.remove(userId);
  }

  // Start spectating a game
  async spectateGame(
    userId: string,
    gameId: string,
    socket: Socket,
  ): Promise<Game> {
    if (this.players.has(userId))
      throw new Error('You are already in a match.');
    if (this.spectators.has(userId))
      throw new Error('You are already spectating a match.');
    if (this.requests.has(userId))
      throw new Error('You have a pending request.');
    if (this.gameQueue.contains(userId))
      throw new Error('You are in the queue.');
    const game = this.getGameById(gameId);
    if (!game) throw new Error('Game does not exist.');
    if (game.status !== GameStatus.STARTED)
      throw new Error('Game is not started or finished.');
    const blocked = await this.userService.getBlockedUsers(userId);
    const blockedUsersIds = blocked.map((user) => user.id);
    game.players.forEach((pId) => {
      if (blockedUsersIds.includes(pId))
        throw new Error('You cannot spectate this game.');
    });
    this.addSpectator(userId, socket);
    game.spectators.push(userId);
    return game;
  }

  // Quit spectating a game
  stopSpectatingGame(userId: string, gameId: string): Game {
    if (!this.spectators.has(userId))
      throw new Error('You are not spectating a match.');
    const game = this.getGameById(gameId);
    if (!game) throw new Error('Game does not exist.');
    this.removeSpectator(userId);
    game.spectators = game.spectators.filter((pId) => pId !== userId);
    return game;
  }

  // Checks if any player has disconnected
  // Sets other player as winner and sets game as finished
  private checkGameDisconnection(game: Game): boolean {
    const p1Sock = this.getPlayerById(game.players[0]); // player 1
    const p2Sock = this.getPlayerById(game.players[1]); // player 2
    if (p1Sock && p2Sock) return true;
    if (!p1Sock) game.score.set(game.players[1], 10);
    else if (!p2Sock) game.score.set(game.players[0], 10);
    this.finishGame(game);
    return false;
  }

  // Sends game data to all players and spectators
  // Change the data being sent to aminimal object
  private sendGameUpdateToClients(game: Game) {
    const players = game.players;
    const spectators = game.spectators;
    players.forEach((p) => {
      const s = this.getPlayerById(p);
      if (s) {
        s.volatile.emit(EV_EMIT_GAME_DATA, game);
      }
    });
    // in case there are spectators
    spectators.forEach((sp) => {
      const s = this.getSpectatorById(sp);
      if (s) {
        s.volatile.emit(EV_EMIT_GAME_DATA, game);
      }
    });
  }

  // Updates game state
  // Called every frame (intervals of 1000ms / 30)
  private updateGame(game: Game): Game {
    // check for disconnection and finish game.
    if (!this.checkGameDisconnection(game)) return game;

    // TODO: update ball position for game.
    // TODO: check for collision and goals.
    // TODO: update score for game.

    // TODO: do other stuff

    // Check for win and finish game.
    if (
      game.score[game.players[0]] === 10 ||
      game.score[game.players[1]] === 10
    ) {
      return this.finishGame(game);
    }
    return game;
  }

  // Called when game starts.
  // Initializes game state
  private initGame(game: Game): Game {
    game.status = GameStatus.STARTED;
    if (!this.checkGameDisconnection(game)) {
      return game;
    }
    // TODO: modify game/models/game.model.ts to add all needed properties for game logic
    // return game object after setting all initial values for ball pos...etc
    // TODO: initialize game state
    return game;
  }

  // Starts initial state of the game
  // Returns game object with status STARTED
  private launchGame(game: Game): Game {
    // Initialize game state
    game = this.initGame(game);
    if (game.status === GameStatus.FINISHED) return game;

    // Start game loop
    const timer: NodeJS.Timer = setInterval(() => {
      const updatedGame = this.updateGame(game);
      if (updatedGame.status === GameStatus.FINISHED) return;
      this.sendGameUpdateToClients(updatedGame);
    }, 1000 / 30);

    // Save interval timer to game object to cancel it later
    game.timer = timer;
    return game;
  }

  // Called twice when players are ready
  // Sets Game as STARTED and calls launchGame
  // Returns Game object with status STARTED
  //
  // In frontend, each player will call this function
  // after they open Game UI. and wait for other player to do the same.
  // When both players are ready, the game will start
  // and they will start receiving game data.
  startGame(userId: string, otherId: string): Game {
    const game = this.getGameByUserIds(userId, otherId);
    if (!game) throw new Error('This game does not exist.');
    if (game.status === GameStatus.STARTED)
      throw new Error('This game has already started.');
    if (game.status === GameStatus.FINISHED)
      throw new Error('This game has already finished.');
    game.playerStatus[userId] = PlayerStatus.READY;
    if (
      game.playerStatus[userId] === PlayerStatus.READY &&
      game.playerStatus[otherId] === PlayerStatus.READY
    ) {
      return this.launchGame(game);
    }
    return game;
  }

  // Move paddle and do other stuff
  // The payload should contain the move data
  private moveGame(game: Game, payload: any): Game {
    // TODO: make move using payload content.
    // TODO: update paddle position for game.
    // NB: no need to update ball position here or send game update to clients
    // TODO: do other stuff
    return game;
  }

  // Make move
  // Called whenever a player makes a move
  // The payload should contain the move data
  // No need to send anything back to client
  // because the game interval will do that 30 times per sec.
  makeMove(userId: string, gameId: string, payload: any): Game {
    // Search for game using gameId for quick access
    const game = this.getGameById(gameId);

    // Security checks before applying move
    if (!game) throw new Error('This game does not exist.');
    if (game.status !== GameStatus.STARTED)
      throw new Error('This game is not started.');
    if (!game.players.includes(userId))
      throw new Error('You are not playing this game.');

    // Apply move
    return this.moveGame(game, payload);
  }

  // Deletes Game / Save in db.
  // Returns Game object with status FINISHED
  leaveGame(userId: string, otherId: string): Game {
    const game = this.getGameByUserIds(userId, otherId);
    if (!game) throw new Error('This game does not exist.');
    if (game.status === GameStatus.FINISHED)
      throw new Error('This game has already finished.');
    game.score.set(otherId, 10);
    this.finishGame(game);
    return game;
  }

  // Called when game is finished/aborted
  private finishGame(game: Game): Game {
    clearInterval(game.timer);
    game.status = GameStatus.FINISHED;
    this.sendGameUpdateToClients(game);
    this.removeGameMembers(game);
    this.games.delete(game.id);
    this.createGameHistory(game);
    return game;
  }

  // Add Play Against request
  // It should be called when you want to play against a user.
  // After security checks, a request is added to the requests map.
  // and the other user if notified to accept or decline.
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
    if (this.gameQueue.contains(userId))
      throw new Error('You are already in the queue.');
    this.addRequest(userId, otherId);
    return true;
  }

  // Creates new Game.
  // Accepts Play Against request
  // Returns Game object with status ACCEPTED
  acceptPlayAgainst(userId: string, otherId: string, userSocket: Socket): Game {
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
    if (!this.connectedUsers.has(otherId)) {
      const cancelledGame = new Game();
      cancelledGame.players = [userId];
      cancelledGame.status = GameStatus.CANCELLED;
      return cancelledGame;
    }
    this.addPlayer(userId, userSocket);
    this.addPlayer(otherId, this.connectedUsers.get(otherId)[0]);
    // Create new game object to track: players, spectators, score, etc.
    const newGame = this.createNewGame(userId, otherId);
    // Add game to games map
    this.games.set(newGame.id, newGame);
    // // Start game
    // await this.startGame(newGame);
    return newGame;
  }

  // Happens before Game is created.
  // Decline Play Against request
  // Returns Game object with status DECLINED
  declinePlayAgainst(userId: string, otherId: string): Game {
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
    const declinedGame = new Game();
    declinedGame.players = [otherId];
    declinedGame.status = GameStatus.DECLINED;
    return declinedGame;
  }

  // Happens before Game is created.
  // Cancel Play Against request
  // Returns Game object with status CANCELLED
  cancelPlayAgainst(userId: string, otherId: string): Game {
    if (userId === otherId)
      throw new Error('You cannot play against yourself.');
    if (this.players.has(userId))
      throw new Error('You are already in a match.');
    if (this.spectators.has(userId))
      throw new Error('You are spectating a match.');
    if (!this.requests.has(userId))
      throw new Error('You do not have a pending request.');
    if (this.requests.get(userId) !== otherId)
      throw new Error('You do not have a pending request.');
    this.removeRequest(userId, otherId);
    const cancelledGame = new Game();
    cancelledGame.players = [userId];
    cancelledGame.status = GameStatus.CANCELLED;
    return cancelledGame;
  }

  // Prisma Stuff
  // Save GameHistory to DB
  async createGameHistory(game: Game): Promise<GameHistory> {
    if (game.players.length !== 2) return null;

    const score1 = game.score[game.players[0]];
    const score2 = game.score[game.players[1]];

    const winnerId = score1 > score2 ? game.players[0] : game.players[1];
    const loserId = score1 > score2 ? game.players[1] : game.players[0];

    const winnerScore = score1 > score2 ? score1 : score2;
    const loserScore = score1 > score2 ? score2 : score1;

    const history = await this.prisma.gameHistory.create({
      data: {
        gameId: game.id,
        winnerId,
        loserId,
        winnerScore,
        loserScore,
      },
    });
    return history;
  }

  async getGameHistoryByUserId(userId: string): Promise<GameHistory[]> {
    const history = await this.prisma.gameHistory.findMany({
      where: {
        OR: [{ winnerId: userId }, { loserId: userId }],
      },
    });
    return history;
  }

  async getWonGamesByUserId(userId: string): Promise<GameHistory[]> {
    const history = await this.prisma.gameHistory.findMany({
      where: {
        winnerId: userId,
      },
    });
    return history;
  }

  async getLostGamesByUserId(userId: string): Promise<GameHistory[]> {
    const history = await this.prisma.gameHistory.findMany({
      where: {
        loserId: userId,
      },
    });
    return history;
  }

  async getGameHistoryByGameId(gameId: string): Promise<GameHistory> {
    const history = await this.prisma.gameHistory.findUnique({
      where: {
        gameId,
      },
    });
    return history;
  }
}
