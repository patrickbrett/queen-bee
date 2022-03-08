import { Component, Dispatch, SetStateAction } from "react";
import { Hex, Team } from "../lib/Hex";
import clsx from "clsx";
import { InsectColour, InsectName } from "../lib/Insect";
import InsectIcon from "./InsectIcon";

interface Props {
  hex: Hex;
  onClick: () => void;
  isPossibility: boolean;
}

export default function HexDisplay({ hex, onClick, isPossibility }: Props) {
  const isOffset = hex.coord.row % 2 > 0;

  const insect = hex.top();

  return (
    <div className="hex-container">
      <div
        className={clsx("hexagon", "hex", isOffset && "offset", insect !== null && 'active', isPossibility && 'possible')}
        style={{
          '--bgcolor': hex.getColour(),
        } as any}
        onClick={onClick}
      >
        {insect !== null && <InsectIcon insectName={insect.kind} team={insect.team} />}
      </div>
    </div>
  );
}
