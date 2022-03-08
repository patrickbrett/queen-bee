import antBlackIcon from "../icons/ant-black.svg";
import beetleBlackIcon from "../icons/beetle-black.svg";
import grasshopperBlackIcon from "../icons/grasshopper-black.svg";
import ladybugBlackIcon from "../icons/ladybug-black.svg";
import mosquitoBlackIcon from "../icons/mosquito-black.svg";
import pillBugBlackIcon from "../icons/pill-bug-black.svg";
import queenBeeBlackIcon from "../icons/queen-bee-black.svg";
import spiderBlackIcon from "../icons/spider-black.svg";

import antWhiteIcon from "../icons/ant-white.svg";
import beetleWhiteIcon from "../icons/beetle-white.svg";
import grasshopperWhiteIcon from "../icons/grasshopper-white.svg";
import ladybugWhiteIcon from "../icons/ladybug-white.svg";
import mosquitoWhiteIcon from "../icons/mosquito-white.svg";
import pillBugWhiteIcon from "../icons/pill-bug-white.svg";
import queenBeeWhiteIcon from "../icons/queen-bee-white.svg";
import spiderWhiteIcon from "../icons/spider-white.svg";
import { Team } from "../lib/Hex";
import { InsectName } from "../lib/Insect";

const icons: Record<Team, Record<InsectName, string>> = {
  [Team.WHITE]: {
    "Soldier Ant": antWhiteIcon,
    Beetle: beetleWhiteIcon,
    Grasshopper: grasshopperWhiteIcon,
    Ladybug: ladybugWhiteIcon,
    Mosquito: mosquitoWhiteIcon,
    Pillbug: pillBugWhiteIcon,
    "Queen Bee": queenBeeWhiteIcon,
    Spider: spiderWhiteIcon,
    NONE: "",
  },
  [Team.BLACK]: {
    "Soldier Ant": antBlackIcon,
    Beetle: beetleBlackIcon,
    Grasshopper: grasshopperBlackIcon,
    Ladybug: ladybugBlackIcon,
    Mosquito: mosquitoBlackIcon,
    Pillbug: pillBugBlackIcon,
    "Queen Bee": queenBeeBlackIcon,
    Spider: spiderBlackIcon,
    NONE: "",
  },
};

interface Props {
  team: Team;
  insectName: InsectName;
}

export default function InsectIcon({ insectName, team }: Props) {
  return (
    <img
      src={icons[team][insectName]}
      style={{ position: "absolute", left: "10px", top: "-7px", zIndex: 1 }}
    />
  );
}
