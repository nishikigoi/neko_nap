import { cellAt } from "./board";
import type { Level, Position } from "./types";

export function conflicts(level: Level, a: Position, b: Position): boolean {
  if (a.row !== b.row && a.col !== b.col) return false;
  if (a.row === b.row && a.col === b.col) return false;

  const rowStep = Math.sign(b.row - a.row);
  const colStep = Math.sign(b.col - a.col);
  let row = a.row + rowStep;
  let col = a.col + colStep;

  while (row !== b.row || col !== b.col) {
    if (cellAt(level, { row, col }) === "furniture") return false;
    row += rowStep;
    col += colStep;
  }
  return true;
}

export function conflictPairs(level: Level, cats: Position[]) {
  const pairs: Array<[Position, Position]> = [];
  for (let i = 0; i < cats.length; i += 1) {
    for (let j = i + 1; j < cats.length; j += 1) {
      if (conflicts(level, cats[i], cats[j])) pairs.push([cats[i], cats[j]]);
    }
  }
  return pairs;
}
