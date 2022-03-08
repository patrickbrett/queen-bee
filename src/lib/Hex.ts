import { Board } from "./Board";
import { Insect, InsectColour } from "./Insect";

export interface Coord {
  row: number;
  col: number;
}

export enum Direction {
  "UR", // up right
  "R", // right
  "DR", // down right
  "DL", // down left
  "L", // left
  "UL", // up left
}

export enum Team {
  "WHITE",
  "BLACK",
}

export class Hex {
  occupants: Insect[]; // Stack, first is bottom
  coord: Coord;
  board: Board;

  constructor(coord: Coord, board: Board) {
    this.occupants = [];
    this.coord = coord;
    this.board = board;
  }

  isEmpty: () => boolean = () => this.occupants.length === 0;

  top: () => Insect | null = () =>
    this.isEmpty() ? null : this.occupants[this.occupants.length - 1];

  getNeighbours: () => Hex[] = () => {
    const coords: Coord[] = [];
    const isEvenRow = this.coord.row % 2 === 0;

    if (this.coord.row > 0) {
      coords.push({
        row: this.coord.row - 1,
        col: isEvenRow ? this.coord.col - 1 : this.coord.col,
      });
      coords.push({
        row: this.coord.row - 1,
        col: isEvenRow ? this.coord.col : this.coord.col + 1,
      });
    }

    coords.push({ row: this.coord.row, col: this.coord.col - 1 });
    coords.push({ row: this.coord.row, col: this.coord.col + 1 });

    if (this.coord.row < this.board.rows - 1) {
      coords.push({
        row: this.coord.row + 1,
        col: isEvenRow ? this.coord.col - 1 : this.coord.col,
      });
      coords.push({
        row: this.coord.row + 1,
        col: isEvenRow ? this.coord.col : this.coord.col + 1,
      });
    }

    return coords.map(this.board.getHex);
  };

  searchEmptyInDirection: (
    direction: Direction
  ) => Hex | null = (direction) => {
    const isEvenRow = this.coord.row % 2 === 0;

    if (this.isEmpty()) return this;

    const coord: Coord | null = (() => {
      switch (direction) {
        case Direction.UR:
          return {
            row: this.coord.row - 1,
            col: isEvenRow ? this.coord.col : this.coord.col + 1,
          };
        case Direction.R:
          return {
            row: this.coord.row,
            col: this.coord.col + 1,
          };
        case Direction.DR:
          return {
            row: this.coord.row + 1,
            col: isEvenRow ? this.coord.col : this.coord.col + 1,
          };
        case Direction.UL:
          return {
            row: this.coord.row - 1,
            col: isEvenRow ? this.coord.col - 1 : this.coord.col,
          };
        case Direction.L:
          return {
            row: this.coord.row,
            col: this.coord.col - 1,
          };
        case Direction.DL:
          return {
            row: this.coord.row + 1,
            col: isEvenRow ? this.coord.col - 1 : this.coord.col,
          };
        default:
          return null;
      }
    })();

    if (coord === null) return null;
    if (
      coord.row < 0 ||
      coord.row >= this.board.rows ||
      coord.col < 0 ||
      coord.col >= this.board.cols
    )
      return null;

    return this.board.getHex(coord).searchEmptyInDirection(direction);
  };

  hasOccupiedNeighbour: (exclude?: Hex) => boolean = (exclude) => {
    console.log(this.getNeighbours());
    return this.getNeighbours().some((hex) => hex && !hex.isEmpty() && (exclude !== hex));
  };

  getColour() {
    if (this.occupants.length === 0) {
      return InsectColour.EMPTY;
    } else if (this.occupants.length === 1) {
      return this.occupants[0].colour;
    } else {
      return this.occupants[this.occupants.length - 1].colour;
    }
  }

  runDfs(fullSet: Set<Hex>, currentSet: Set<Hex>): boolean {
    currentSet.add(this);

    const occupiedNeighbours = this.getNeighbours().filter(hex => hex && !hex.isEmpty() && !currentSet.has(hex));

    if (occupiedNeighbours.length === 0) return fullSet.size === currentSet.size;

    return occupiedNeighbours.some(hex => hex.runDfs(fullSet, currentSet));
  }
}
