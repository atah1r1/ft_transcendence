import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { UserService } from 'src/user/user.service';
import Queue from 'src/utils/queue';
import Game, { GameStatus, PlayerStatus } from './models/game.model';

const EV_EMIT_GAME_DATA = 'emit_game_data';

@Injectable()
export class GameService {
  constructor(private userService: UserService) {
    // Start Game Loop
    this.gamesLoop();
  }

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

  createNewGame(userId: string, opponentId: string): Game {
    const newGame = new Game();
    const gameId = `${userId}_${opponentId}`;
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

  removeGameMembers(game: Game) {
    game.players.forEach((pId) => {
      this.removePlayer(pId);
    });
    game.spectators.forEach((pId) => {
      this.removeSpectator(pId);
    });
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

  // Add Play Against request
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

  async leaveQueue(userId: string): Promise<boolean> {
    return this.gameQueue.remove(userId);
  }

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
    if (!p2Sock) game.score.set(game.players[0], 10);
    game.status = GameStatus.FINISHED;
    // TODO: save game score to database.
    this.games.delete(game.id);
    return false;
  }

  // Sends game data to all players and spectators
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
  private updateGame(game: Game): Game {
    if (!this.checkGameDisconnection(game)) {
      return game;
    }
    // TODO: update ball position for game.
    // TODO: update score for game.
    // TODO: check for disconnection and finish game.
    // TODO: check for win and finish game.
    // TODO: do other stuff
    return game;
  }

  // Loops through all games and updates them
  private async gamesLoop() {
    while (true) {
      this.games.forEach((game) => {
        if (game.status !== GameStatus.STARTED) return;
        const updatedGame = this.updateGame(game);
        // notify clients of game update
        this.sendGameUpdateToClients(updatedGame);
        if (updatedGame.status === GameStatus.FINISHED) {
          this.removeGameMembers(updatedGame);
        }
      });
    }
  }

  // Starts initial state of the game
  // Returns game object with status STARTED
  private launchGame(game: Game): Game {
    game.status = GameStatus.STARTED;
    // Check if any player has disconnected
    // then set game as finished and set full score for opponent
    if (!this.checkGameDisconnection(game)) {
      return game;
    }
    // TODO: implement game logic
    // TODO: modify game/models/game.model.ts to add all needed properties for game logic

    // To emit events, access the sockets of the players and spectators
    // from game object
    const p1Sock = this.getPlayerById(game.players[0]); // player 1
    const p2Sock = this.getPlayerById(game.players[1]); // player 2
    // do something with p1Sock and p2Sock

    // All spectators
    game.spectators.forEach((spectatorId) => {
      const sock = this.getSpectatorById(spectatorId);
      // do something with sock
    });

    // To update score
    const oldScore1 = game.score.get(game.players[0]);
    game.score.set(game.players[0], oldScore1 + 1);

    const oldScore2 = game.score.get(game.players[1]);
    game.score.set(game.players[1], oldScore2 + 1);

    // return game object after setting all initial values for ball pos...etc
    return game;
  }

  // Called twice when players are ready
  // Sets Game as STARTED and calls launchGame
  // Returns Game object with status STARTED
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

  // move paddle and do other stuff
  private moveGame(game: Game, payload: any): Game {
    // TODO: update paddle position for game.
    // NB: no need to update ball position here or send game update to clients
    // TODO: do other stuff
    return game;
  }

  // Make move
  makeMove(userId: string, gameId: string, payload: any): Game {
    const game = this.getGameById(gameId);

    if (!game) throw new Error('This game does not exist.');
    if (game.status !== GameStatus.STARTED)
      throw new Error('This game is not started.');
    if (!game.players.includes(userId))
      throw new Error('You are not playing this game.');

    // TODO: make move using payload content.
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
    game.status = GameStatus.FINISHED;
    // Save game to database.
    this.games.delete(game.id);
    return game;
  }

  // Deletes Game / Save in db.
  // Returns Game object with status FINISHED
  // leaveGameOnDisconnect(userId: string): Game {
  //   const game = this.getGameByUserId(userId);

  //   if (!game) throw new Error('This game does not exist.');

  //   if (game.status === GameStatus.FINISHED)
  //     throw new Error('This game has already finished.');

  //   const otherId = game.players.find((p) => p !== userId);

  //   game.score.set(otherId, 10);
  //   game.status = GameStatus.FINISHED;
  //   // Save game to database.
  //   this.games.delete(game.id);
  //   return game;
  // }

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
}
