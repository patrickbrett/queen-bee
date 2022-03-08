import { Coord, Hex, Team } from "./Hex";
import {
  Beetle,
  Grasshopper,
  Insect,
  Ladybug,
  Mosquito,
  Pillbug,
  QueenBee,
  SoldierAnt,
  Spider,
} from "./Insect";
import { OnlineClient, Turn, TurnType } from "./OnlineClient";

export type InsectType =
  | QueenBee
  | Spider
  | Beetle
  | Grasshopper
  | SoldierAnt
  | Mosquito
  | Ladybug
  | Pillbug;

export type HandPiece = {
  kind: typeof Insect;
  count: number;
};

export type Hand = HandPiece[];

const startingHand: () => Hand = () => [
  { kind: QueenBee, count: 1 },
  { kind: Spider, count: 2 },
  { kind: Beetle, count: 2 },
  { kind: Grasshopper, count: 3 },
  { kind: SoldierAnt, count: 3 },
];

export class Board {
  hexes: Hex[][];
  rows: number;
  cols: number;
  currentTurn: Team;
  hands: Record<Team, Hand>;
  handleUpdate: () => void;
  onlineClient: OnlineClient;

  constructor(onlineClient: OnlineClient, rows: number, cols: number) {
    this.onlineClient = onlineClient;
    onlineClient.onTurnReceived(this.handleOpponentTurnReceived.bind(this));

    this.rows = rows;
    this.cols = cols;
    this.hexes = new Array(rows)
      .fill(null)
      .map((_, row) =>
        new Array(cols).fill(null).map((_, col) => new Hex({ row, col }, this))
      );

    this.currentTurn = Team.WHITE;
    this.hands = {
      [Team.WHITE]: startingHand(),
      [Team.BLACK]: startingHand(),
    };

    this.handleUpdate = () => {};
  }

  handlePlayerTurn(turn: Turn): void {
    console.log("sending turn", turn);
    
    this.onlineClient.sendTurn(turn);

    this.handleUpdate();
  }

  handleOpponentTurnReceived(turn: Turn): void {
    console.log("opp rec", turn);

    if (turn.turnType === TurnType.MOVE_INSECT) {
      const insect = this.getHex(turn.fromHexCoord).top();
      if (!insect) return;
      insect.move(this.getHex(turn.toHexCoord), true);
    } else if (turn.turnType === TurnType.PLACE_INSECT) {
      const hand = this.hands[this.currentTurn].find(hand => hand.kind.kind === turn.insectType);
      if (!hand) return;
      hand.count--;

      const hex = this.getHex(turn.toHexCoord);

      const insectType = hand.kind;
      new insectType(this.currentTurn, hex, true);
    }

    this.nextTurn();
  }

  getHex: (coord: Coord) => Hex = (coord) => {
    return this.hexes[coord.row][coord.col];
  };

  nextTurn: () => void = () => {
    // Flip player
    this.currentTurn =
      this.currentTurn === Team.WHITE ? Team.BLACK : Team.WHITE;

    this.expandBoardIfNecessary();
    
    this.handleUpdate();
  };

  expandBoardIfNecessary: () => void = () => {
    // Check top
    if (this.hexes[0].some(hex => !hex.isEmpty())) {
      this.hexes.unshift(new Array(this.cols).fill(null).map((_, col) => new Hex({ row: 0, col }, this)));
      this.rows++;
    }

    // Check bottom
    if (this.hexes[this.rows - 1].some(hex => !hex.isEmpty())) {
      this.hexes.push(new Array(this.cols).fill(null).map((_, col) => new Hex({ row: this.rows, col }, this)));
      this.rows++;
    }

    // Check left
    if (this.hexes.some(row => !row[0].isEmpty())) {
      this.hexes.forEach((row, i) => row.unshift(new Hex({ row: i, col: 0 }, this)));
      this.cols++;
    }

    // Check right
    if (this.hexes.some(row => !row[this.cols - 1].isEmpty())) {
      this.hexes.forEach((row, i) => row.push(new Hex({ row: i, col: this.cols }, this)));
      this.cols++;
    }

    // Update indexes
    this.hexes.forEach((row, i) => row.forEach((hex, j) => {
      hex.coord = {
        row: i,
        col: j,
      };
    }))
  }

  onUpdate: (handler: () => void) => void = (handler) =>
    (this.handleUpdate = handler);

  checkConnected: () => boolean = () => {
    // Find a starting point
    const allHexes = this.hexes
      .reduce((acc, curr) => acc.concat(curr), [])
      .filter((hex) => !hex.isEmpty());

    if (allHexes.length === 0) return true;

    const startingPoint = allHexes[0];
    const allHexesSet = new Set(allHexes);
    return startingPoint.runDfs(allHexesSet, new Set());
  };

  checkConnectedWithExclusion: (exclude: Hex) => boolean = (exclude) => {
    // Remove the exclusion temporarily
    const occupant = exclude.occupants.pop();

    const result = this.checkConnected();

    if (occupant) exclude.occupants.push(occupant);

    return result;
  };

  checkConnectedWithExclusionAndInclusion: (
    exclude: Hex,
    include: Hex
  ) => boolean = (exclude, include) => {
    const occupant = exclude.occupants.pop();
    if (occupant) include.occupants.push(occupant);

    const result = this.checkConnected();

    if (occupant) {
      include.occupants.pop();
      exclude.occupants.push(occupant);
    }

    return result;
  };

  getPlaceableLocations: () => Hex[] = () => {
    const allHexes = this.hexes.reduce((acc, curr) => acc.concat(curr), []);

    if (this.isEmpty()) return allHexes;

    return allHexes.filter(hex => hex.isEmpty() && hex.hasOccupiedNeighbour());
  }

  isEmpty: () => boolean = () => {
    const allHexes = this.hexes.reduce((acc, curr) => acc.concat(curr), []);
    return allHexes.every(hex => hex.isEmpty());
  }
}
