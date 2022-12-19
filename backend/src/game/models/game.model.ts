export enum GameStatus {
  ACCEPTED,
  DECLINED,
  CANCELLED,
  QUEUED,
  STARTED,
  FINISHED,
}

export enum PlayerStatus {
  PENDING,
  READY,
}

export default class Game {
  id: string;
  players: string[];
  spectators: string[];
  score: Map<string, number>;
  status: GameStatus;
  playerStatus: Map<string, PlayerStatus>;
  // TODO: add other fields for ball position, etc.
}
