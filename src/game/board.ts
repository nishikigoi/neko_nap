import type { Level, Position } from "./types";

export const positionKey = ({ row, col }: Position) => `r${row}c${col}`;

export const samePosition = (a: Position, b: Position) =>
  a.row === b.row && a.col === b.col;

export const cellAt = (level: Level, { row, col }: Position) =>
  level.cells[row * level.width + col];

export const allBeds = (level: Level): Position[] => {
  const beds: Position[] = [];
  level.cells.forEach((cell, index) => {
    if (cell === "bed") {
      beds.push({ row: Math.floor(index / level.width), col: index % level.width });
    }
  });
  return beds;
};
