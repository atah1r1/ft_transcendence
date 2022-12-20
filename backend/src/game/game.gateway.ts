import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { User } from '@prisma/client';
import { Socket, Server } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { GameService } from './game.service';
import Game from './models/game.model';

const EV_PLAY_AGAINST = 'play_against';
const EV_PLAY_QUEUE = 'play_queue';
const EV_PLAY_AGAINST_ACCEPT = 'play_against_accept';
const EV_PLAY_AGAINST_DECLINE = 'play_against_decline';
const EV_PLAY_AGAINST_CANCEL = 'play_against_cancel';
const EV_START_GAME = 'start_game';
const EV_LEAVE_GAME = 'leave_game';
const EV_LEAVE_QUEUE = 'leave_queue';
const EV_SPECTATE_GAME = 'spectate_game';
const EV_GAME_MOVE = 'game_move';

const EV_EMIT_PLAY_AGAINST_REQUEST = 'emit_play_against_request';
const EV_EMIT_GAME = 'emit_game';
const EV_EMIT_SPECTATE_GAME = 'emit_spectate_game';
const EV_EMIT_LEAVE_QUEUE = 'emit_leave_queue';

@WebSocketGateway({ namespace: 'game', cors: true, origins: '*' })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private gameService: GameService,
  ) {}

  @WebSocketServer() server: Server;

  private async verifyAndSave(client: Socket) {
    const token: string = client.handshake.auth.token as string;
    // console.log('token: ', token);
    const decoded = await this.authService.verifyToken(token);
    // save the user id in the socket
    client.data = decoded;
  }

  // Authenticate user and add to connected users
  async handleConnection(client: Socket) {
    try {
      await this.verifyAndSave(client);
      this.gameService.addConnectedUser(client.data.id, client);
    } catch (err) {
      client.disconnect();
    }
  }

  // Remove user from connected users
  handleDisconnect(client: Socket) {
    // Remove this particular socket from the list of connected sockets
    this.gameService.removeConnectedUser(client.data.id, client);
    const sockets = this.gameService.getConnectedUserById(client.data.id);

    // If no sockets are left, remove the user from the queue and requests.
    if (!sockets || sockets.length === 0) {
      this.gameService.removeRequestByUserId(client.data.id);
      this.gameService.leaveQueue(client.data.id);
    }

    // If this socket is used for playing remove the player.
    if (this.gameService.getPlayerById(client.data.id) === client) {
      this.gameService.removePlayer(client.data.id);
    }

    // If this socket is used for spectating remove the spectator.
    if (this.gameService.getSpectatorById(client.data.id) === client) {
      this.gameService.removeSpectator(client.data.id);
    }
  }

  /* *********** */
  /*  VALIDATORS */
  /* *********** */
  validatePlayAgainst(payload: any) {
    if (!('userId' in payload)) {
      throw new WsException({
        error: EV_PLAY_AGAINST,
        message: 'Invalid payload',
      });
    }
    if (typeof payload.userId !== 'string') {
      throw new WsException({
        error: EV_PLAY_AGAINST,
        message: 'Invalid payload',
      });
    }
  }

  validateMakeMove(payload: any) {
    // TODO: add validation as follows:
    if (!('gameId' in payload)) {
      throw new WsException({
        error: EV_GAME_MOVE,
        message: 'Invalid payload',
      });
    }
    if (typeof payload.gameId !== 'string') {
      throw new WsException({
        error: EV_GAME_MOVE,
        message: 'Invalid payload',
      });
    }
  }

  validateSpectateGame(payload: any) {
    if (!('gameId' in payload)) {
      throw new WsException({
        error: EV_SPECTATE_GAME,
        message: 'Invalid payload',
      });
    }
    if (typeof payload.gameId !== 'string') {
      throw new WsException({
        error: EV_SPECTATE_GAME,
        message: 'Invalid payload',
      });
    }
  }

  sendPlayAgainstRequestToClient(userId: string, opUser: User) {
    const sockets = this.gameService.getConnectedUserById(userId);
    sockets.forEach((s) => {
      s.emit(EV_EMIT_PLAY_AGAINST_REQUEST, opUser);
    });
  }

  sendGameToClients(game: Game) {
    const players = game.players;
    const spectators = game.spectators;
    players.forEach((p) => {
      const s = this.gameService.getPlayerById(p);
      if (s) {
        s.emit(EV_EMIT_GAME, game);
      }
    });
    // in case there are spectators
    spectators.forEach((sp) => {
      const s = this.gameService.getSpectatorById(sp);
      if (s) {
        s.emit(EV_EMIT_GAME, game);
      }
    });
  }

  sendGameToSpectator(client: Socket, game: Game) {
    if (client) {
      client.emit(EV_EMIT_SPECTATE_GAME, game);
    }
  }

  sendQueueLeftToClient(client: Socket, left: boolean) {
    client.emit(EV_EMIT_LEAVE_QUEUE, left);
  }

  /* ********** */
  /*   EVENTS   */
  /* ********** */
  @SubscribeMessage(EV_PLAY_QUEUE)
  async playInQueue(client: any, payload: any) {
    try {
      const game = await this.gameService.playInQueue(
        client.data.id,
        payload.userId,
      );
      if (game) {
        this.sendGameToClients(game);
      }
    } catch (err) {
      throw new WsException({
        error: EV_PLAY_QUEUE,
        message: err.message,
      });
    }
  }

  @SubscribeMessage(EV_PLAY_AGAINST)
  async playAgainst(client: any, payload: any) {
    this.validatePlayAgainst(payload);
    try {
      const reqAdded = await this.gameService.playAgainst(
        client.data.id,
        payload.userId,
      );
      if (reqAdded) {
        const user = await this.userService.getUserById(
          client.data.id,
          client.data.id,
        );
        this.sendPlayAgainstRequestToClient(payload.userId, user);
      }
    } catch (err) {
      throw new WsException({
        error: EV_PLAY_AGAINST,
        message: err.message,
      });
    }
  }

  @SubscribeMessage(EV_PLAY_AGAINST_ACCEPT)
  async playAgainstAccept(client: any, payload: any) {
    this.validatePlayAgainst(payload);
    try {
      const game = this.gameService.acceptPlayAgainst(
        client.data.id,
        payload.userId,
        client,
      );
      if (game) {
        this.sendGameToClients(game);
      }
    } catch (err) {
      throw new WsException({
        error: EV_PLAY_AGAINST_ACCEPT,
        message: err.message,
      });
    }
  }

  @SubscribeMessage(EV_PLAY_AGAINST_DECLINE)
  async playAgainstDecline(client: any, payload: any) {
    this.validatePlayAgainst(payload);
    try {
      const game = this.gameService.declinePlayAgainst(
        client.data.id,
        payload.userId,
      );
      if (game) {
        this.sendGameToClients(game);
      }
    } catch (err) {
      throw new WsException({
        error: EV_PLAY_AGAINST_DECLINE,
        message: err.message,
      });
    }
  }

  @SubscribeMessage(EV_PLAY_AGAINST_CANCEL)
  async playAgainstCancel(client: any, payload: any) {
    this.validatePlayAgainst(payload);
    try {
      const game = this.gameService.cancelPlayAgainst(
        client.data.id,
        payload.userId,
      );
      if (game) {
        this.sendGameToClients(game);
      }
    } catch (err) {
      throw new WsException({
        error: EV_PLAY_AGAINST_CANCEL,
        message: err.message,
      });
    }
  }

  @SubscribeMessage(EV_START_GAME)
  async startGame(client: any, payload: any) {
    this.validatePlayAgainst(payload);
    try {
      const game = this.gameService.startGame(client.data.id, payload.userId);
      if (game) {
        this.sendGameToClients(game);
      }
    } catch (err) {
      throw new WsException({
        error: EV_START_GAME,
        message: err.message,
      });
    }
  }

  @SubscribeMessage(EV_LEAVE_GAME)
  async leaveGame(client: any, payload: any) {
    this.validatePlayAgainst(payload);
    try {
      this.gameService.leaveGame(client.data.id, payload.userId);
    } catch (err) {
      throw new WsException({
        error: EV_LEAVE_GAME,
        message: err.message,
      });
    }
  }

  @SubscribeMessage(EV_LEAVE_QUEUE)
  async leaveQueue(client: any, payload: any) {
    try {
      const left = await this.gameService.leaveQueue(client.data.id);
      this.sendQueueLeftToClient(client, left ?? false);
    } catch (err) {
      throw new WsException({
        error: EV_LEAVE_GAME,
        message: err.message,
      });
    }
  }

  @SubscribeMessage(EV_SPECTATE_GAME)
  async spectateGame(client: any, payload: any) {
    this.validateSpectateGame(payload);
    try {
      const game = await this.gameService.spectateGame(
        client.data.id,
        payload.gameId,
        client,
      );
      this.sendGameToSpectator(client, game);
    } catch (err) {
      throw new WsException({
        error: EV_LEAVE_GAME,
        message: err.message,
      });
    }
  }

  @SubscribeMessage(EV_SPECTATE_GAME)
  async stopSpectatingGame(client: any, payload: any) {
    this.validateSpectateGame(payload);
    try {
      this.gameService.stopSpectatingGame(client.data.id, payload.gameId);
    } catch (err) {
      throw new WsException({
        error: EV_LEAVE_GAME,
        message: err.message,
      });
    }
  }

  @SubscribeMessage(EV_GAME_MOVE)
  async makeMove(client: any, payload: any) {
    this.validateMakeMove(payload);
    try {
      this.gameService.makeMove(client.data.id, payload.gameId, payload);
    } catch (err) {
      throw new WsException({
        error: EV_START_GAME,
        message: err.message,
      });
    }
  }
}
