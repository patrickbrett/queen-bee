import React, { useState } from "react";
import "./App.css";
import { Board, HandPiece } from "./lib/Board";
import HandTile from "./components/HandTile";
import HexDisplay from "./components/HexDisplay";
import { Hex, Team } from "./lib/Hex";
import { Insect } from "./lib/Insect";
import { OnlineClient } from "./lib/OnlineClient";

const client = new OnlineClient();

const board = new Board(client, 10, 10);

const hostGame = async () => {
  console.log("starting")
  const gameId = await client.startGame();
  console.log('started');
  console.log(gameId);
}

const joinGame = async () => {
  const gameId = window.prompt("Enter game ID");
  if (gameId === null) return;
  console.log('joining');
  await client.joinGame(gameId);
  console.log('joined');
}

function App() {
  const [activePiece, setActivePiece] = useState<HandPiece | Insect | null>(
    null
  );

  const forceUpdate = React.useReducer(() => ({}), {})[1] as () => void;

  board.onUpdate(forceUpdate);

  const availableMoves = (() => {
    if (
      activePiece instanceof Insect &&
      activePiece.team === board.currentTurn
    ) {
      return activePiece.getAvailableMovesFiltered();
    } else if (activePiece !== null) {
      return board.getPlaceableLocations();
    } else {
      return [];
    }
  })();

  const onClickHex: (hex: Hex) => void = (hex) => {
    if (activePiece == null) {
      if (!hex.isEmpty() && hex.top()!.team === board.currentTurn) {
        setActivePiece(hex.top());
      }
      return;
    }

    if (activePiece instanceof Insect) {
      if (
        activePiece.team === board.currentTurn &&
        availableMoves.includes(hex)
      ) {
        activePiece.move(hex);
        board.nextTurn();
      }
    } else {
      if (
        (availableMoves.includes(hex) && activePiece.count > 0)
      ) {
        activePiece.count--;
        const insectType = activePiece.kind;
        new insectType(board.currentTurn, hex);
        board.nextTurn();
      }
    }

    setActivePiece(null);
  };

  return (
    <div className="App">
      <div className="hex-board">
        {board.hexes.map((row) => (
          <div className="hex-row">
            {row.map((hex) => (
              <HexDisplay
                hex={hex}
                onClick={() => onClickHex(hex)}
                isPossibility={availableMoves.includes(hex)}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="hand">
        {board.hands[board.currentTurn].map((handPiece) => (
          <HandTile
            handPiece={handPiece}
            board={board}
            activeHandPiece={activePiece}
            setActiveHandPiece={setActivePiece}
          />
        ))}
      </div>
      <div>
        <button onClick={hostGame}>Host Game</button>
        <button onClick={joinGame}>Join Game</button>
      </div>
    </div>
  );
}

export default App;
