import { Hex } from "../lib/Hex";
import clsx from "clsx";
import InsectIcon from "./InsectIcon";

interface Props {
  hex: Hex;
  onClick: () => void;
  isPossibility: boolean;
}

export default function HexDisplay({ hex, onClick, isPossibility }: Props) {
  const isOffset = hex.coord.row % 2 > 0;

  const insect = hex.top();

  const isHidden =
    (hex.coord.row === 0 && hex.coord.col === 0) ||
    (hex.coord.row === hex.board.rows - 1 &&
      hex.coord.row % 2 === 0 &&
      hex.coord.col === 0) ||
    (hex.coord.row === hex.board.rows - 1 &&
      hex.coord.row % 2 === 1 &&
      hex.coord.col === hex.board.cols - 1);

  return (
    <div className="hex-container">
      <div
        className={clsx(
          "hexagon",
          "hex",
          isOffset && "offset",
          insect !== null && "active",
          isPossibility && "possible",
          isHidden && "hidden"
        )}
        style={
          {
            "--bgcolor": hex.getColour(),
          } as any
        }
        onClick={onClick}
      >
        {insect !== null && (
          <InsectIcon insectName={insect.kind} team={insect.team} />
        )}
      </div>
    </div>
  );
}
