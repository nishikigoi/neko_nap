import type { Level, Position } from "./types";

export interface FurnitureLayoutMetrics {
  furnitureCount: number;
  activeFurnitureCount: number;
  horizontalCutCount: number;
  verticalCutCount: number;
  occupiedRowCount: number;
  occupiedColumnCount: number;
  rowBandCount: number;
  columnBandCount: number;
  quadrantCount: number;
  maxHorizontalSegments: number;
  maxVerticalSegments: number;
}

function seesBed(level: Level, origin: Position, rowStep: number, columnStep: number) {
  let row = origin.row + rowStep;
  let col = origin.col + columnStep;
  while (row >= 0 && row < level.height && col >= 0 && col < level.width) {
    const cell = level.cells[row * level.width + col];
    if (cell === "furniture") return false;
    if (cell === "bed") return true;
    row += rowStep;
    col += columnStep;
  }
  return false;
}

function bedBearingSegments(level: Level, axis: "horizontal" | "vertical") {
  const lineCount = axis === "horizontal" ? level.height : level.width;
  const lineLength = axis === "horizontal" ? level.width : level.height;
  return Array.from({ length: lineCount }, (_, line) => {
    let segmentHasBed = false;
    let count = 0;
    for (let offset = 0; offset < lineLength; offset += 1) {
      const row = axis === "horizontal" ? line : offset;
      const col = axis === "horizontal" ? offset : line;
      const cell = level.cells[row * level.width + col];
      if (cell === "furniture") {
        if (segmentHasBed) count += 1;
        segmentHasBed = false;
      } else if (cell === "bed") {
        segmentHasBed = true;
      }
    }
    return count + (segmentHasBed ? 1 : 0);
  });
}

function band(coordinate: number, length: number) {
  return Math.min(2, Math.floor(((coordinate + .5) * 3) / length));
}

export function evaluateFurnitureLayout(level: Level): FurnitureLayoutMetrics {
  const positions = level.cells.flatMap((cell, index): Position[] =>
    cell === "furniture" ? [{ row: Math.floor(index / level.width), col: index % level.width }] : []);
  const horizontalCuts = positions.filter((position) =>
    seesBed(level, position, 0, -1) && seesBed(level, position, 0, 1));
  const verticalCuts = positions.filter((position) =>
    seesBed(level, position, -1, 0) && seesBed(level, position, 1, 0));
  const active = new Set([
    ...horizontalCuts.map(({ row, col }) => `${row},${col}`),
    ...verticalCuts.map(({ row, col }) => `${row},${col}`),
  ]);
  const horizontalSegments = bedBearingSegments(level, "horizontal");
  const verticalSegments = bedBearingSegments(level, "vertical");

  return {
    furnitureCount: positions.length,
    activeFurnitureCount: active.size,
    horizontalCutCount: horizontalCuts.length,
    verticalCutCount: verticalCuts.length,
    occupiedRowCount: new Set(positions.map(({ row }) => row)).size,
    occupiedColumnCount: new Set(positions.map(({ col }) => col)).size,
    rowBandCount: new Set(positions.map(({ row }) => band(row, level.height))).size,
    columnBandCount: new Set(positions.map(({ col }) => band(col, level.width))).size,
    quadrantCount: new Set(positions.map(({ row, col }) =>
      `${row < level.height / 2 ? "top" : "bottom"}-${col < level.width / 2 ? "left" : "right"}`)).size,
    maxHorizontalSegments: Math.max(0, ...horizontalSegments),
    maxVerticalSegments: Math.max(0, ...verticalSegments),
  };
}
