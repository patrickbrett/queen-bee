import { io, Socket } from "socket.io-client";
import { Coord } from "./Hex";
import { InsectName } from "./Insect";

export enum TurnType {
  PLACE_INSECT,
  MOVE_INSECT,
}

export interface PlaceInsectTurn {
  turnType: TurnType.PLACE_INSECT;
  insectType: InsectName;
  toHexCoord: Coord;
}

export interface MoveInsectTurn {
  turnType: TurnType.MOVE_INSECT;
  fromHexCoord: Coord;
  toHexCoord: Coord;
}

export type Turn = PlaceInsectTurn | MoveInsectTurn;

export class OnlineClient {
  socket: Socket;
  turnHandler: (turn: Turn) => void;

  constructor() {
    this.socket = io("ws://localhost:3001");

    this.turnHandler = () => {};

    this.socket.on("turn", (turn) => {
      console.log("received turn", turn);
      this.turnHandler(turn);
    });
  }

  sendTurn(turn: Turn) {
    this.socket.emit("turn", turn);
  }

  onTurnReceived(turnHandler: (turn: Turn) => void): void {
    this.turnHandler = turnHandler;
  }

  startGame(): Promise<string> {
    this.socket.emit("start-game");

    return new Promise((resolve) => {
      this.socket.on("game-start", (gameId) => {
        resolve(gameId);
        this.socket.removeAllListeners("game-start");
      });
    });
  }

  joinGame(gameId: string): Promise<void> {
    this.socket.emit("join-game", gameId);

    return new Promise((resolve) => {
      this.socket.on("game-joined", () => {
        resolve();
        this.socket.removeAllListeners("game-joined");
      });
    });
  }
}
