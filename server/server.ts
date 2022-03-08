import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import { v4 as uuidv4 } from 'uuid';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

interface Coord {
  row: number;
  col: number;
}

type InsectName =
  | "Queen Bee"
  | "Spider"
  | "Beetle"
  | "Grasshopper"
  | "Soldier Ant"
  | "Ladybug"
  | "Mosquito"
  | "Pillbug"
  | "NONE";

enum TurnType {
  PLACE_INSECT,
  MOVE_INSECT
}

interface PlaceInsectTurn {
  turnType: TurnType.PLACE_INSECT;
  insectType: InsectName;
  toHexCoord: Coord;
}

interface MoveInsectTurn {
  turnType: TurnType.MOVE_INSECT;
  fromHexCoord: Coord;
  toHexCoord: Coord;
}

export type Turn = PlaceInsectTurn | MoveInsectTurn;

interface Game {
  gameId: string;
  hostSocket: Socket;
  joinedSocket: Socket | null;
}

const games: Record<string, Game> = {}; // maps game ID to game
const usersInGames: Record<string, string> = {}; // maps user ID to game ID

io.on("connection", (socket: Socket) => {
  console.log("a user connected");

  socket.on("start-game", () => {
    console.log("Start game request");

    const gameId = uuidv4().slice(0, 5);

    const game: Game = {
      gameId,
      hostSocket: socket,
      joinedSocket: null,
    };
    games[gameId] = game;

    usersInGames[socket.id] = gameId;

    console.log("sending game id", gameId);
    socket.emit("game-start", gameId);
  });

  socket.on("join-game", (gameIdCaseSensitive: string) => {
    const gameId = gameIdCaseSensitive.toLowerCase();

    if (!games.hasOwnProperty(gameId)) return;
    if (games[gameId].joinedSocket !== null) return;

    games[gameId].joinedSocket = socket;
    usersInGames[socket.id] = gameId;

    console.log(games, usersInGames);

    socket.emit("game-joined");
  });

  socket.on("turn", (turn: Turn) => {
    console.log("received turn", turn);

    if (!usersInGames.hasOwnProperty(socket.id) || !games.hasOwnProperty(usersInGames[socket.id])) return;
    
    const game = games[usersInGames[socket.id]];
    const otherSocket = (socket === game.hostSocket) ? game.joinedSocket : game.hostSocket;
    if (!otherSocket) return;
    otherSocket?.emit("turn", turn);

    console.log("sent turn", turn);
  });
});

server.listen(3001, () => {
  console.log("listening on *:3001");
});
