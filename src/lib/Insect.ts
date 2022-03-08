import { Direction, Hex, Team } from "./Hex";
import { MoveInsectTurn, PlaceInsectTurn, TurnType } from "./OnlineClient";
import { setDifference } from "./utils";

export enum InsectColour {
  YELLOW_GOLD = "#ebc428",
  BROWN = "#8f7d38",
  PURPLE = "#9926bf",
  GREEN = "#46ab3f",
  BLUE = "#439cbf",
  GREY = "#969696",
  RED = "#b83232",
  CYAN = "#4ae8ed",
  NONE = "#000000",
  EMPTY = "#89fa91",
}

export type InsectName =
  | "Queen Bee"
  | "Spider"
  | "Beetle"
  | "Grasshopper"
  | "Soldier Ant"
  | "Ladybug"
  | "Mosquito"
  | "Pillbug"
  | "NONE";

export class Insect {
  currentHex: Hex;

  static colour: InsectColour = InsectColour.NONE;
  static kind: InsectName = "NONE";

  colour = Insect.colour;

  team: Team;

  get kind() {
    return Insect.kind;
  }

  constructor(team: Team, hex: Hex, silent?: boolean) {
    this.team = team;
    this.currentHex = hex;
    this.currentHex.occupants.push(this);

    console.log(this.kind);

    const turn: PlaceInsectTurn = {
      insectType: this.kind,
      toHexCoord: this.currentHex.coord,
      turnType: TurnType.PLACE_INSECT,
    }
    if (!silent) this.currentHex.board.handlePlayerTurn(turn);
  }

  move: (hex: Hex, silent?: boolean) => void = (hex, silent) => {
    const turn: MoveInsectTurn = {
      fromHexCoord: this.currentHex.coord,
      toHexCoord: hex.coord,
      turnType: TurnType.MOVE_INSECT,
    }

    this.currentHex.occupants.pop();
    this.currentHex = hex;
    this.currentHex.occupants.push(this);

    if (!silent) this.currentHex.board.handlePlayerTurn(turn);
  };

  getAvailableMoves: () => Hex[] = () => [];

  /**
   * Filters available moves such that the hive remains intact
   */
  getAvailableMovesFiltered: () => Hex[] = () => {
    const unfiltered = this.getAvailableMoves();

    // Check if the absence of the insect in general breaks the graph. If not, just return the whole unfiltered list
    // if (this.currentHex.board.checkConnectedWithExclusion(this.currentHex) === true) {
    //   return unfiltered;
    // }

    // Otherwise, we must (unfortunately) check each of the possible moves with DFS...
    return unfiltered.filter((hex) =>
      this.currentHex.board.checkConnectedWithExclusionAndInclusion(
        this.currentHex,
        hex
      )
    );
  };

  isOnTop: () => boolean = () => this.currentHex?.top() === this;

  toString() {
    return JSON.stringify({
      kind: this.constructor.name,
      team: Team[this.team],
    });
  }
}

export class QueenBee extends Insect {
  static colour = InsectColour.YELLOW_GOLD;
  static kind: InsectName = "Queen Bee";

  colour = QueenBee.colour;

  get kind() {
    return QueenBee.kind;
  }

  getAvailableMoves = () => {
    return this.currentHex
      .getNeighbours()
      .filter((neighbour) => neighbour.isEmpty());
  };
}

export class Spider extends Insect {
  static colour = InsectColour.BROWN;
  static kind: InsectName = "Spider";

  colour = Spider.colour;

  get kind() {
    return Spider.kind;
  }

  getAvailableMoves = () => {
    const firstDegreeNeighbours = this.currentHex
      .getNeighbours()
      .filter((hex) => hex.hasOccupiedNeighbour() && hex.isEmpty());

    const secondDegreeNeighbours = firstDegreeNeighbours
      .map((hex) =>
        hex
          .getNeighbours()
          .filter((hex) => hex.hasOccupiedNeighbour() && hex.isEmpty())
      )
      .reduce((acc, curr) => acc.concat(curr), []);

    const thirdDegreeNeighbours = new Set(
      secondDegreeNeighbours
        .map((hex) =>
          hex
            .getNeighbours()
            .filter((hex) => hex.hasOccupiedNeighbour() && hex.isEmpty())
        )
        .reduce((acc, curr) => acc.concat(curr), [])
    );

    const thirdMinusSecond = setDifference(
      thirdDegreeNeighbours,
      new Set(secondDegreeNeighbours)
    );
    const thirdMinusSecondMinusFirst = setDifference(
      thirdMinusSecond,
      new Set(firstDegreeNeighbours)
    );

    console.log(
      "neigh",
      firstDegreeNeighbours,
      secondDegreeNeighbours,
      thirdDegreeNeighbours,
      thirdMinusSecond,
      thirdMinusSecondMinusFirst
    );

    return Array.from(thirdMinusSecondMinusFirst);
  };
}

export class Beetle extends Insect {
  static colour = InsectColour.PURPLE;
  static kind: InsectName = "Beetle";

  colour = Beetle.colour;

  get kind() {
    return Beetle.kind;
  }

  getAvailableMoves = () => {
    return this.currentHex.getNeighbours();
  };
}

export class Grasshopper extends Insect {
  static colour = InsectColour.GREEN;
  static kind: InsectName = "Grasshopper";

  colour = Grasshopper.colour;

  get kind() {
    return Grasshopper.kind;
  }

  getAvailableMoves = () => {
    const neighbours = this.currentHex.getNeighbours();

    const moves = [
      Direction.UR,
      Direction.R,
      Direction.DR,
      Direction.DL,
      Direction.L,
      Direction.UL,
    ]
      .map((direction) => this.currentHex.searchEmptyInDirection(direction))
      .filter((hex) => hex !== null && !neighbours.includes(hex)) as Hex[];

    return moves;
  };
}

export class SoldierAnt extends Insect {
  static colour = InsectColour.BLUE;
  static kind: InsectName = "Soldier Ant";

  colour = SoldierAnt.colour;

  get kind() {
    return SoldierAnt.kind;
  }

  getAvailableMoves = () => {
    const allHexes = this.currentHex.board.hexes.reduce(
      (acc, curr) => acc.concat(curr),
      []
    );

    return allHexes.filter(
      (hex) =>
        hex.isEmpty() &&
        hex.hasOccupiedNeighbour(this.currentHex) &&
        hex.getNeighbours().filter((neighbour) => !neighbour.isEmpty())
          .length !== 5 // 'cornered' situation
    );
  };
}

export class Mosquito extends Insect {
  static colour = InsectColour.GREY;
  static kind: InsectName = "Mosquito";

  colour = Mosquito.colour;

  get kind() {
    return Mosquito.kind;
  }
}

export class Ladybug extends Insect {
  static colour = InsectColour.RED;
  static kind: InsectName = "Ladybug";

  colour = Ladybug.colour;

  get kind() {
    return Ladybug.kind;
  }
}

export class Pillbug extends Insect {
  static colour = InsectColour.CYAN;
  static kind: InsectName = "Pillbug";

  colour = Pillbug.colour;

  get kind() {
    return Pillbug.kind;
  }
}
