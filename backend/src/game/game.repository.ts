import { Socket } from 'socket.io';
import Queue from 'src/utils/queue';
import Game from './models/game.model';

export default class GameRepository {
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

  private static instance: GameRepository;
  private constructor() {
    console.log('GameRepository created');
  }
  public static getInstance(): GameRepository {
    if (!GameRepository.instance) {
      GameRepository.instance = new GameRepository();
    }
    return GameRepository.instance;
  }
}
