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

export class Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
  rad: number;
}

export class Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  colour: string;
}

export default class Game {
  id: string;
  players: string[];
  spectators: string[];
  score: Map<string, number>;
  status: GameStatus;
  playerStatus: Map<string, PlayerStatus>;
  timer: NodeJS.Timer;
  ball: Ball;
  paddle: Map<string, Paddle>;

  // TODO: add other fields for ball position, etc.
}
