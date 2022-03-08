import clsx from "clsx";
import { Dispatch, SetStateAction } from "react";
import { Board, HandPiece } from "../lib/Board";
import { Insect, InsectColour } from "../lib/Insect";
import InsectIcon from "./InsectIcon";

interface Props {
  handPiece: HandPiece;
  board: Board;
  activeHandPiece: HandPiece | Insect | null;
  setActiveHandPiece: Dispatch<SetStateAction<HandPiece | Insect | null>>;
}

export default function HandTile({
  handPiece,
  board,
  activeHandPiece,
  setActiveHandPiece,
}: Props) {
  const isActive = activeHandPiece === handPiece;

  return (
    <div className="hand-item">
      <div
        className={clsx("hex hexagon", isActive && "active-alt")}
        style={
          {
            "--bgcolor": handPiece.kind.colour,
          } as any
        }
        onClick={() => setActiveHandPiece(activeHandPiece === handPiece ? null : handPiece)}
      >
        <InsectIcon insectName={handPiece.kind.kind} team={board.currentTurn} />
      </div>

      <div className="piece-count">{handPiece.count}</div>
    </div>
  );
}
