export type CellKind = "floor" | "bed" | "furniture";
export type BedMark = "empty" | "cat" | "cross";

export interface Position {
  row: number;
  col: number;
}

export interface Level {
  id: string;
  number: number;
  width: number;
  height: number;
  catCount: number;
  cells: CellKind[];
  title: string;
  instruction?: string;
  initialCats?: Position[];
}

export type Marks = Record<string, BedMark>;

export interface GameState {
  levelId: string;
  marks: Marks;
  history: Marks[];
  startedAt: number;
  moveCount: number;
  undoCount: number;
  hintCount: number;
  completedAt?: number;
}

export interface SolveResult {
  solutionCount: number;
  firstSolution?: Position[];
}
