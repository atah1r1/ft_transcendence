import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { GameService } from './game.service';

const EV_PLAY_AGAINST = 'play_against';
const EV_PLAY_AGAINST_ACCEPT = 'play_against_accept';
const EV_PLAY_AGAINST_DECLINE = 'play_against_decline';

const EV_EMIT_PLAY_AGAINST_REQUEST = 'emit_play_against_request';
const EV_EMIT_GAME_ID = 'emit_game_id';
const EV_EMIT_DECLINE = 'emit_decline';

@WebSocketGateway({ namespace: 'game', cors: true, origins: '*' })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private authService: AuthService,
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

  async handleConnection(client: Socket) {
    try {
      await this.verifyAndSave(client);
      this.gameService.addConnectedUser(client.data.id, client);
    } catch (err) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.gameService.removePlayer(client.data.id);
    this.gameService.removeSpectator(client.data.id);
    this.gameService.removeConnectedUser(client.data.id, client);
  }

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

  sendPlayAgainstRequestToClient(userId: string, opId: string) {
    const sockets = this.gameService.getConnectedUserById(userId);
    sockets.forEach((s) => {
      s.emit(EV_EMIT_PLAY_AGAINST_REQUEST, {
        userId: opId,
      });
    });
  }

  sendGameIdToClients(gameId: string) {
    const players = this.gameService.getGameById(gameId);
    players.forEach((p) => {
      const s = this.gameService.getPlayerById(p);
      if (s) {
        s.emit(EV_EMIT_GAME_ID, { gameId });
      }
    });
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
        this.sendPlayAgainstRequestToClient(client.data.id, payload.userId);
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
      const gameId = await this.gameService.acceptPlayAgainst(
        client.data.id,
        payload.userId,
        client,
      );
      if (gameId) {
        this.sendGameIdToClients(gameId);
      }
    } catch (err) {
      throw new WsException({
        error: EV_PLAY_AGAINST,
        message: err.message,
      });
    }
  }
}
