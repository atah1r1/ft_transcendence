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
  usernames: Map<string, string>;
  avatars: Map<string, string>;

  convertToJSON() {
    let score = {};
    if (this.score) {
      score = {
        [this.players[0]]: this.score.get(this.players[0]),
        [this.players[1]]: this.score.get(this.players[1]),
      };
    }
    let playerStatus = {};
    if (this.playerStatus) {
      playerStatus = {
        [this.players[0]]: this.playerStatus.get(this.players[0]),
        [this.players[1]]: this.playerStatus.get(this.players[1]),
      };
    }
    let paddle = {};
    if (this.paddle) {
      paddle = {
        [this.players[0]]: this.paddle.get(this.players[0]),
        [this.players[1]]: this.paddle.get(this.players[1]),
      };
    }
    let usernames = {};
    if (this.usernames) {
      usernames = {
        [this.players[0]]: this.usernames.get(this.players[0]),
        [this.players[1]]: this.usernames.get(this.players[1]),
      };
    }
    let avatars = {};
    if (this.avatars) {
      avatars = {
        [this.players[0]]: this.avatars.get(this.players[0]),
        [this.players[1]]: this.avatars.get(this.players[1]),
      };
    }

    return {
      id: this.id,
      players: this.players,
      spectators: this.spectators,
      status: this.status,
      ball: this.ball,
      usernames: usernames,
      avatars: avatars,
      score: score,
      playerStatus: playerStatus,
      paddle: paddle,
    };
  }

  convertToMinifyedJSON() {
    let score = {};
    if (this.score) {
      score = {
        [this.players[0]]: this.score.get(this.players[0]),
        [this.players[1]]: this.score.get(this.players[1]),
      };
    }
    let paddle = {};
    if (this.paddle) {
      paddle = {
        [this.players[0]]: this.paddle.get(this.players[0]),
        [this.players[1]]: this.paddle.get(this.players[1]),
      };
    }
    let usernames = {};
    if (this.usernames) {
      usernames = {
        [this.players[0]]: this.usernames.get(this.players[0]),
        [this.players[1]]: this.usernames.get(this.players[1]),
      };
    }

    return {
      id: this.id,
      players: this.players,
      status: this.status,
      ball: this.ball,
      usernames: usernames,
      score: score,
      paddle: paddle,
    };
  }
}
