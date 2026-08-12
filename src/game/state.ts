import { allBeds, positionKey } from "./board";
import { conflictPairs } from "./lineOfSight";
import type { BedMark, GameState, Level, Marks, Position } from "./types";

const nextMark: Record<BedMark, BedMark> = {
  empty: "cat",
  cat: "cross",
  cross: "empty",
};

export function createGameState(level: Level, now = Date.now()): GameState {
  const marks = Object.fromEntries(allBeds(level).map((bed) => [positionKey(bed), "empty"])) as Marks;
  for (const cat of level.initialCats ?? []) marks[positionKey(cat)] = "cat";
  return {
    levelId: level.id,
    marks,
    history: [],
    startedAt: now,
    moveCount: 0,
    undoCount: 0,
    hintCount: 0,
  };
}

export function cycleBed(state: GameState, key: string): GameState {
  const previous = state.marks[key];
  if (!previous) return state;
  return {
    ...state,
    marks: { ...state.marks, [key]: nextMark[previous] },
    history: [...state.history, state.marks],
    moveCount: state.moveCount + 1,
  };
}

export function undo(state: GameState): GameState {
  const previous = state.history.at(-1);
  if (!previous) return state;
  return {
    ...state,
    marks: previous,
    history: state.history.slice(0, -1),
    undoCount: state.undoCount + 1,
  };
}

export function catsFromMarks(level: Level, marks: Marks): Position[] {
  return allBeds(level).filter((bed) => marks[positionKey(bed)] === "cat");
}

export function isComplete(level: Level, marks: Marks) {
  const cats = catsFromMarks(level, marks);
  return cats.length === level.catCount && conflictPairs(level, cats).length === 0;
}
