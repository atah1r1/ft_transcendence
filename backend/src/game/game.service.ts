import { Injectable } from '@nestjs/common';
import { GameHistory } from '@prisma/client';
import { Socket, Server } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import GameRepository from './game.repository';
import Game, {
  Ball,
  GameStatus,
  Paddle,
  PlayerStatus,
} from './models/game.model';

const EV_EMIT_GAME_DATA = 'emit_game_data';
const EV_EMIT_GAME_FINISH = 'emit_game_finish';
const EV_EMIT_LIVE_GAMES_UPDATED = 'emit_live_games_updated';

@Injectable()
export class GameService {
  constructor(
    private userService: UserService,
    private prisma: PrismaService,
  ) {}

  getConnectedUsersIds(): string[] {
    return [...GameRepository.getInstance().connectedUsers.keys()];
  }

  getConnectedUserById(userId: string): Socket[] {
    return GameRepository.getInstance().connectedUsers.get(userId) ?? [];
  }

  getGameById(gameId: string): Game {
    return GameRepository.getInstance().games.get(gameId);
  }

  getGameByUserIds(userId: string, otherId: string): Game {
    const game = [...GameRepository.getInstance().games.values()].find(
      (game) => {
        return game.players.includes(userId) && game.players.includes(otherId);
      },
    );
    return game;
  }

  getGameByUserId(userId: string): Game {
    const game = [...GameRepository.getInstance().games.values()].find(
      (game) => {
        return game.players.includes(userId);
      },
    );
    return game;
  }

  getPlayerById(userId: string): Socket {
    return GameRepository.getInstance().players.get(userId);
  }

  getSpectatorById(userId: string): Socket {
    return GameRepository.getInstance().spectators.get(userId);
  }

  // Unsafe method.
  addConnectedUser(userId: string, socket: Socket) {
    const sockets = GameRepository.getInstance().connectedUsers.get(userId);
    if (sockets) {
      sockets.push(socket);
    } else {
      GameRepository.getInstance().connectedUsers.set(userId, [socket]);
    }
  }

  // Unsafe method.
  removeConnectedUser(userId: string, socket: Socket) {
    const sockets = GameRepository.getInstance().connectedUsers.get(userId);
    if (!sockets) return;
    const newSockets = sockets.filter((s) => s.id !== socket.id);
    if (newSockets.length === 0) {
      GameRepository.getInstance().connectedUsers.delete(userId);
    } else {
      GameRepository.getInstance().connectedUsers.set(userId, newSockets);
    }
  }

  // Unsafe method.
  addPlayer(userId: string, socket: Socket) {
    GameRepository.getInstance().players.set(userId, socket);
  }

  // Unsafe method.
  addSpectator(userId: string, socket: Socket) {
    GameRepository.getInstance().spectators.set(userId, socket);
  }

  // Unsafe method.
  addRequest(userId: string, opponentId: string) {
    GameRepository.getInstance().requests.set(userId, opponentId);
    GameRepository.getInstance().requests.set(opponentId, userId);
  }

  // Unsafe method.
  addToQueue(userId: string) {
    GameRepository.getInstance().gameQueue.push(userId);
  }

  // Creates a new game in the ACCEPTED state.
  async createNewGame(userId: string, opponentId: string): Promise<Game> {
    const user = await this.userService.getUserById(userId, userId);
    const opUser = await this.userService.getUserById(userId, opponentId);

    const newGame = new Game();
    const gameId = `${userId}_${opponentId}_${Date.now()}`;
    newGame.id = gameId;
    newGame.players = [userId, opponentId];
    newGame.spectators = [];

    newGame.usernames = new Map();
    newGame.usernames.set(userId, user.username ?? 'Unknown');
    newGame.usernames.set(opponentId, opUser.username ?? 'Unknown');

    newGame.avatars = new Map();
    newGame.avatars.set(userId, user.avatar);
    newGame.avatars.set(opponentId, opUser.avatar);

    newGame.score = new Map();
    newGame.score.set(userId, 0);
    newGame.score.set(opponentId, 0);

    newGame.playerStatus = new Map();
    newGame.playerStatus.set(userId, PlayerStatus.PENDING);
    newGame.playerStatus.set(opponentId, PlayerStatus.PENDING);

    newGame.ball = new Ball();
    newGame.paddle = new Map<string, Paddle>();

    newGame.status = GameStatus.ACCEPTED;
    return newGame;
  }

  // Unsafe method.
  // remove player from players map
  removePlayer(userId: string) {
    GameRepository.getInstance().players.delete(userId);
  }

  // Unsafe method.
  // remove spectator from spectators map
  removeSpectator(userId: string) {
    GameRepository.getInstance().spectators.delete(userId);
  }

  // Unsafe method.
  // remove request from requests map
  removeRequest(userId: string, opponentId: string) {
    GameRepository.getInstance().requests.delete(userId);
    GameRepository.getInstance().requests.delete(opponentId);
  }

  removeRequestByUserId(userId: string) {
    const opponentId = GameRepository.getInstance().requests.get(userId);
    GameRepository.getInstance().requests.delete(userId);
    if (opponentId) GameRepository.getInstance().requests.delete(opponentId);
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
    return [...GameRepository.getInstance().players.keys()];
  }

  // Get all spectator userIds
  getSpectatorIds(): string[] {
    return [...GameRepository.getInstance().spectators.keys()];
  }

  // Get list of friends (User) that are playing a game
  async getPlayingFriends(userId: string): Promise<any[]> {
    const friends = await this.userService.getFriends(userId);
    if (!friends) return [];
    const players = friends.filter((friend) =>
      GameRepository.getInstance().players.has(friend.id),
    );
    return players;
  }

  // Get list of friends (User) that are spectating a game
  async getSpectatingFriends(userId: string): Promise<any[]> {
    const friends = await this.userService.getFriends(userId);
    if (!friends) return [];
    const players = friends.filter((friend) =>
      GameRepository.getInstance().spectators.has(friend.id),
    );
    return players;
  }

  // Sends game data to all players and spectators
  // Change the data being sent to aminimal object
  private sendGameUpdateToClients(game: Game) {
    const players = game.players;
    const spectators = game.spectators;
    players.forEach((p) => {
      const s = this.getPlayerById(p);
      if (s) {
        s.volatile.emit(EV_EMIT_GAME_DATA, game.convertToMinifyedJSON());
      }
    });
    // in case there are spectators
    spectators.forEach((sp) => {
      const s = this.getSpectatorById(sp);
      if (s) {
        s.volatile.emit(EV_EMIT_GAME_DATA, game.convertToMinifyedJSON());
      }
    });
  }

  private sendGameFinishToClients(game: Game) {
    const players = game.players;
    const spectators = game.spectators;
    players.forEach((p) => {
      const s = this.getPlayerById(p);
      if (s) {
        s.volatile.emit(EV_EMIT_GAME_FINISH, game.convertToJSON());
      }
    });
    // in case there are spectators
    spectators.forEach((sp) => {
      const s = this.getSpectatorById(sp);
      if (s) {
        s.volatile.emit(EV_EMIT_GAME_FINISH, game.convertToJSON());
      }
    });
  }

  private sendLiveGamesUpdatedToAll(server: Server) {
    let gamesTotalScore = 0;
    GameRepository.getInstance().games.forEach((game) => {
      gamesTotalScore += game.score.get(game.players[0]);
      gamesTotalScore += game.score.get(game.players[1]);
    });
    server.emit(EV_EMIT_LIVE_GAMES_UPDATED, gamesTotalScore);
  }

  // Join the auto-match queue
  // If you can play with player before you (not blocked)
  // the game will be created, next, both players need to send startGame event
  // to start the game
  // Otherwise you will be pushed to the queue and wait until someone joins
  // In both cases you recieve a game object with status ACCEPTED or QUEUED
  // respectively, so either show a waiting screen or start the game.
  async playInQueue(userId: string, socket: Socket): Promise<Game> {
    if (GameRepository.getInstance().players.has(userId))
      throw new Error('You are already in a match.');
    if (GameRepository.getInstance().spectators.has(userId))
      throw new Error('You are spectating a match.');
    if (GameRepository.getInstance().requests.has(userId))
      throw new Error('You already have a pending request.');
    if (GameRepository.getInstance().gameQueue.contains(userId))
      throw new Error('You are already in the queue.');
    if (!GameRepository.getInstance().gameQueue.isEmpty()) {
      const otherId = GameRepository.getInstance().gameQueue.peek();
      const blocked = await this.userService.getBlockedUsers(userId);
      const blockedUsersIds = blocked.map((user) => user.id);
      if (
        !blockedUsersIds.includes(otherId) &&
        GameRepository.getInstance().connectedUsers.has(otherId)
      ) {
        const opId = GameRepository.getInstance().gameQueue.pop();
        this.addPlayer(userId, socket);
        this.addPlayer(
          otherId,
          GameRepository.getInstance().connectedUsers.get(opId)[0],
        );
        const newGame = await this.createNewGame(userId, opId);
        GameRepository.getInstance().games.set(newGame.id, newGame);
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
    return GameRepository.getInstance().gameQueue.remove(userId);
  }

  // Start spectating a game
  async spectateGame(
    userId: string,
    gameId: string,
    socket: Socket,
  ): Promise<Game> {
    if (GameRepository.getInstance().players.has(userId))
      throw new Error('You are already in a match.');
    if (GameRepository.getInstance().spectators.has(userId))
      throw new Error('You are already spectating a match.');
    if (GameRepository.getInstance().requests.has(userId))
      throw new Error('You have a pending request.');
    if (GameRepository.getInstance().gameQueue.contains(userId))
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
    if (!GameRepository.getInstance().spectators.has(userId))
      throw new Error('You are not spectating a match.');
    const game = this.getGameById(gameId);
    if (!game) throw new Error('Game does not exist.');
    this.removeSpectator(userId);
    game.spectators = game.spectators.filter((pId) => pId !== userId);
    return game;
  }

  //Ball Collision function
  private collision(objGame: any, paddle: any) {
    if (
      (objGame.ball.x - objGame.ball.rad >= paddle.x - paddle.width / 2 &&
        objGame.ball.x - objGame.ball.rad <= paddle.x + paddle.width / 2 &&
        objGame.ball.y >= paddle.y &&
        objGame.ball.y <= paddle.y + paddle.height) ||
      (objGame.ball.x + objGame.ball.rad >= paddle.x - paddle.width / 2 &&
        objGame.ball.x + objGame.ball.rad <= paddle.x + paddle.width / 2 &&
        objGame.ball.y >= paddle.y &&
        objGame.ball.y <= paddle.y + paddle.height)
    ) {
      return true;
    }
    return false;

    // if (
    //   paddle.x + paddle.width > objGame.ball.x &&
    //   paddle.x < objGame.ball.x + objGame.ball.rad &&
    //   paddle.y + paddle.height > objGame.ball.y &&
    //   paddle.y < objGame.ball.dy + objGame.ball.rad
    // ) {
    //   return true;
    // } else {
    //   return false;
    // }
  }

  // Checks if any player has disconnected
  // Sets other player as winner and sets game as finished
  private checkGameDisconnection(game: Game, server: Server): boolean {
    const p1Sock = this.getPlayerById(game.players[0]); // player 1
    const p2Sock = this.getPlayerById(game.players[1]); // player 2
    if (p1Sock && p2Sock) return true;
    if (!p1Sock) game.score.set(game.players[1], 10);
    else if (!p2Sock) game.score.set(game.players[0], 10);
    this.finishGame(game, server);
    return false;
  }

  // Updates game state
  // Called every frame (intervals of 1000ms / 30)
  private updateGame(game: Game, server: Server): Game {
    // check for disconnection and finish game.
    if (!this.checkGameDisconnection(game, server)) return game;
    //ball handle
    if (game.ball.y < 0 || game.ball.y + game.ball.rad > 720) {
      game.ball.dy = -game.ball.dy;
    }

    // check for scoring
    if (game.ball.x < 0) {
      //update points +1
      game.score.set(game.players[1], game.score.get(game.players[1]) + 1);
      if (game.score.get(game.players[1]) < 10) {
        this.sendLiveGamesUpdatedToAll(server);
      }
      //Send the new point

      game.ball.x = 640;
      game.ball.y = 350;
      game.ball.dx = -6;
      game.ball.dy = -6;
      //update score here
    } else if (game.ball.x + game.ball.rad > 1280) {
      //update points +1
      game.score.set(game.players[0], game.score.get(game.players[0]) + 1);
      if (game.score.get(game.players[0]) < 10) {
        this.sendLiveGamesUpdatedToAll(server);
      }
      // Send the new score

      game.ball.x = 640;
      game.ball.y = 350;
      game.ball.dx = 6;
      game.ball.dy = 6;
      //update score here
    }

    if (
      this.collision(game, game.paddle.get(game.players[0])) &&
      game.ball.dx < 0
    ) {
      game.ball.dx = -game.ball.dx;
    }

    if (
      this.collision(game, game.paddle.get(game.players[1])) &&
      game.ball.dx > 0
    ) {
      game.ball.dx = -game.ball.dx;
    }

    game.ball.x += game.ball.dx;
    game.ball.y += game.ball.dy;

    // Check for win and finish game.
    if (
      game.score.get(game.players[0]) === 10 ||
      game.score.get(game.players[1]) === 10
    ) {
      return this.finishGame(game, server);
    }
    return game;
  }

  // Called when game starts.
  // Initializes game state
  private initGame(game: Game, server: Server): Game {
    game.status = GameStatus.STARTED;
    if (!this.checkGameDisconnection(game, server)) {
      return game;
    }
    // TODO: modify game/models/game.model.ts to add all needed properties for game logic
    // return game object after setting all initial values for ball pos...etc
    // TODO: initialize game state
    game.ball.x = 640;
    game.ball.y = 350;
    game.ball.dx = 6;
    game.ball.dy = 6;
    game.ball.rad = 10;

    game.paddle = new Map();
    game.paddle.set(game.players[0], new Paddle());
    game.paddle.set(game.players[1], new Paddle());
    for (let i = 0; i < 2; i++) {
      if (i == 0) {
        game.paddle.get(game.players[i]).x = 10;
        game.paddle.get(game.players[i]).y = 0;
        game.paddle.get(game.players[i]).width = 8;
        game.paddle.get(game.players[i]).height = 100;
        game.paddle.get(game.players[i]).colour = '#02CEFC';
      } else {
        game.paddle.get(game.players[i]).x = 1262;
        game.paddle.get(game.players[i]).y = 0;
        game.paddle.get(game.players[i]).width = 8;
        game.paddle.get(game.players[i]).height = 100;
        game.paddle.get(game.players[i]).colour = '#ED006C';
      }
    }

    return game;
  }

  // Starts initial state of the game
  // Returns game object with status STARTED
  private launchGame(game: Game, server: Server): Game {
    // Initialize game state
    game = this.initGame(game, server);
    if (game.status === GameStatus.FINISHED) return game;

    // Start game loop
    const timer: NodeJS.Timer = setInterval(() => {
      const updatedGame = this.updateGame(game, server);
      if (updatedGame.status === GameStatus.FINISHED) return;
      this.sendGameUpdateToClients(updatedGame);
    }, 1000 / 60);
    // Save interval timer to game object to cancel it later
    this.sendLiveGamesUpdatedToAll(server);
    game.timer = timer;
    return game;
  }

  // Called twice when players are ready
  // Sets Game as STARTED and calls launchGame
  // Returns Game object with status STARTED
  // In frontend, each player will call this function
  // after they open Game UI. and wait for other player to do the same.
  // When both players are ready, the game will start
  // and they will start receiving game data.
  startGame(userId: string, otherId: string, server: Server): Game {
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
      return this.launchGame(game, server);
    }
    return game;
  }

  // Move paddle and do other stuff
  // The payload should contain the move data
  private moveGame(userId: string, game: Game, payload: any): Game {
    if (payload.move === 'DOWN' && game.paddle.get(userId).y < 620)
      game.paddle.get(userId).y += 40;

    if (payload.move === 'UP' && game.paddle.get(userId).y > 0)
      game.paddle.get(userId).y -= 40;

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
    return this.moveGame(userId, game, payload);
  }

  // Deletes Game / Save in db.
  // Returns Game object with status FINISHED
  leaveGame(userId: string, otherId: string, server: Server): Game {
    const game = this.getGameByUserIds(userId, otherId);
    if (!game) throw new Error('This game does not exist.');
    if (game.status === GameStatus.FINISHED)
      throw new Error('This game has already finished.');
    game.score.set(otherId, 10);
    this.finishGame(game, server);
    return game;
  }

  // Called when game is finished/aborted
  private finishGame(game: Game, server: Server): Game {
    clearInterval(game.timer);
    game.status = GameStatus.FINISHED;
    this.sendGameFinishToClients(game);
    this.removeGameMembers(game);
    GameRepository.getInstance().games.delete(game.id);
    this.createGameHistory(game);
    this.sendLiveGamesUpdatedToAll(server);
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
    if (GameRepository.getInstance().players.has(userId))
      throw new Error('You are already in a match.');
    if (GameRepository.getInstance().spectators.has(userId))
      throw new Error('You are spectating a match.');
    if (GameRepository.getInstance().players.has(otherId))
      throw new Error('This user is already in a match.');
    if (GameRepository.getInstance().spectators.has(otherId))
      throw new Error('This user is spectating a match.');
    if (GameRepository.getInstance().requests.has(userId))
      throw new Error('You already have a pending request.');
    if (GameRepository.getInstance().requests.has(otherId))
      throw new Error('This user already has a pending request.');
    if (GameRepository.getInstance().gameQueue.contains(userId))
      throw new Error('You are already in the queue.');
    if (GameRepository.getInstance().gameQueue.contains(otherId))
      throw new Error('This user already in the queue.');
    this.addRequest(userId, otherId);
    return true;
  }

  // Creates new Game.
  // Accepts Play Against request
  // Returns Game object with status ACCEPTED
  async acceptPlayAgainst(
    userId: string,
    otherId: string,
    userSocket: Socket,
  ): Promise<Game> {
    if (userId === otherId)
      throw new Error('You cannot play against yourself.');
    if (GameRepository.getInstance().players.has(userId))
      throw new Error('You are already in a match.');
    if (GameRepository.getInstance().spectators.has(userId))
      throw new Error('You are spectating a match.');
    if (GameRepository.getInstance().players.has(otherId))
      throw new Error('This user is already in a match.');
    if (GameRepository.getInstance().spectators.has(otherId))
      throw new Error('This user is spectating a match.');
    if (!GameRepository.getInstance().requests.has(userId))
      throw new Error('You do not have a pending request.');
    if (GameRepository.getInstance().requests.get(userId) !== otherId)
      throw new Error('You do not have a pending request.');
    this.removeRequest(userId, otherId);
    if (!GameRepository.getInstance().connectedUsers.has(otherId)) {
      const cancelledGame = new Game();
      cancelledGame.players = [userId];
      cancelledGame.status = GameStatus.CANCELLED;
      return cancelledGame;
    }
    this.addPlayer(userId, userSocket);
    this.addPlayer(
      otherId,
      GameRepository.getInstance().connectedUsers.get(otherId)[0],
    );
    // Create new game object to track: players, spectators, score, etc.
    const newGame = await this.createNewGame(userId, otherId);
    // Add game to games map
    GameRepository.getInstance().games.set(newGame.id, newGame);
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
    if (GameRepository.getInstance().players.has(userId))
      throw new Error('You are already in a match.');
    if (GameRepository.getInstance().spectators.has(userId))
      throw new Error('You are spectating a match.');
    if (GameRepository.getInstance().players.has(otherId))
      throw new Error('This user is already in a match.');
    if (GameRepository.getInstance().spectators.has(otherId))
      throw new Error('This user is spectating a match.');
    if (!GameRepository.getInstance().requests.has(userId))
      throw new Error('You do not have a pending request.');
    if (GameRepository.getInstance().requests.get(userId) !== otherId)
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
    if (GameRepository.getInstance().players.has(userId))
      throw new Error('You are already in a match.');
    if (GameRepository.getInstance().spectators.has(userId))
      throw new Error('You are spectating a match.');
    if (!GameRepository.getInstance().requests.has(userId))
      throw new Error('You do not have a pending request.');
    if (GameRepository.getInstance().requests.get(userId) !== otherId)
      throw new Error('You do not have a pending request.');
    this.removeRequest(userId, otherId);
    const cancelledGame = new Game();
    cancelledGame.players = [userId, otherId];
    cancelledGame.status = GameStatus.CANCELLED;
    return cancelledGame;
  }

  // Prisma Stuff
  // Save GameHistory to DB
  async createGameHistory(game: Game): Promise<GameHistory> {
    if (game.players.length !== 2) return null;

    const score1: number = game.score.get(game.players[0]);
    const score2: number = game.score.get(game.players[1]);

    const winnerId = score1 > score2 ? game.players[0] : game.players[1];
    const loserId = score1 > score2 ? game.players[1] : game.players[0];

    const winnerScore: number = score1 > score2 ? score1 : score2;
    const loserScore: number = score1 > score2 ? score2 : score1;

    const history = await this.prisma.gameHistory.create({
      data: {
        gameId: game.id,
        winnerId,
        loserId,
        winnerScore: winnerScore ?? 0,
        loserScore: loserScore ?? 0,
      },
    });
    return history;
  }

  async getGameHistoryByUserId(userId: string, id: string): Promise<any[]> {
    const blocked = await this.userService.getBlockedUsers(userId);
    const blockedUsersIds = blocked.map((user) => user.id);
    if (blockedUsersIds.includes(id)) throw new Error('User is blocked');

    const history = await this.prisma.gameHistory.findMany({
      where: {
        OR: [{ winnerId: id }, { loserId: id }],
      },
      include: {
        loser: true,
        winner: true,
      },
    });
    return history;
  }

  async getGameHistoryByGameId(
    userId: string,
    gameId: string,
  ): Promise<GameHistory> {
    const history = await this.prisma.gameHistory.findUnique({
      where: {
        gameId,
      },
    });

    const blocked = await this.userService.getBlockedUsers(userId);
    const blockedUsersIds = blocked.map((user) => user.id);
    if (
      blockedUsersIds.includes(history.loserId) ||
      blockedUsersIds.includes(history.winnerId)
    )
      throw new Error('User is blocked');

    return history;
  }

  async getLiveGames(userId: string): Promise<any[]> {
    const blocked = await this.userService.getBlockedUsers(userId);
    const blockedUsersIds = blocked.map((user) => user.id);

    const liveGames = [];

    GameRepository.getInstance().games.forEach((game) => {
      if (game.status !== GameStatus.STARTED) return;
      if (game.players.some((player) => blockedUsersIds.includes(player)))
        return;
      liveGames.push({
        id: game.id,
        players: [
          {
            id: game.players[0],
            username: game.usernames.get(game.players[0]),
            score: game.score.get(game.players[0]),
            avatar: game.avatars.get(game.players[0]),
          },
          {
            id: game.players[1],
            username: game.usernames.get(game.players[1]),
            score: game.score.get(game.players[1]),
            avatar: game.avatars.get(game.players[1]),
          },
        ],
        numberOfSpectators:
          game.spectators.length > 0
            ? `${game.spectators.length} users are watching`
            : `No one is watching`,
      });
    });
    return liveGames;
  }
}
