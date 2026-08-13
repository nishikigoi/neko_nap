import { evaluateDifficulty } from "../src/game/difficulty";
import { solveLevel } from "../src/game/solver";
import type { CellKind } from "../src/game/types";
import { levels } from "../src/levels/levels";

const source = levels[19];
const furnitureIndices = source.cells
  .map((cell, index) => cell === "furniture" ? index : -1)
  .filter((index) => index >= 0);
const kinds: CellKind[] = ["furniture", "vertical-barrier", "horizontal-barrier"];
let best: ReturnType<typeof evaluateDifficulty> | undefined;
let bestCells: CellKind[] | undefined;
const solutionCounts = new Map<number, number>();

for (let mask = 0; mask < 3 ** furnitureIndices.length; mask += 1) {
  if (mask === 0) continue;
  const cells = [...source.cells];
  let remaining = mask;
  for (const index of furnitureIndices) {
    cells[index] = kinds[remaining % kinds.length];
    remaining = Math.floor(remaining / kinds.length);
  }
  if (!kinds.every((kind) => cells.includes(kind))) continue;
  const count = solveLevel({ ...source, cells, solutionPolicy: undefined }, 31).solutionCount;
  solutionCounts.set(count, (solutionCounts.get(count) ?? 0) + 1);
  if (count !== 1) continue;
  const candidate = { ...source, cells, solutionPolicy: { min: count, max: count } };
  const metrics = evaluateDifficulty(candidate);
  if (!best || metrics.ambiguityScore > best.ambiguityScore) {
    best = metrics;
    bestCells = cells;
  }
}

const symbols: Record<CellKind, string> = {
  floor: ".",
  bed: "B",
  furniture: "F",
  "vertical-barrier": "V",
  "horizontal-barrier": "H",
};

console.log({ solutionCounts: [...solutionCounts.entries()].sort((a, b) => a[0] - b[0]), best });
if (bestCells) {
  for (let row = 0; row < source.height; row += 1) {
    console.log(bestCells.slice(row * source.width, (row + 1) * source.width).map((cell) => symbols[cell]).join(""));
  }

  let adjustedBest: ReturnType<typeof evaluateDifficulty> | undefined;
  let adjustedCells: CellKind[] | undefined;
  bestCells.forEach((cell, index) => {
    if (cell !== "bed") return;
    const cells = [...bestCells!];
    cells[index] = "floor";
    const candidate = { ...source, cells, solutionPolicy: { min: 1, max: 1 } };
    if (solveLevel(candidate, 2).solutionCount !== 1) return;
    const metrics = evaluateDifficulty(candidate);
    if (!adjustedBest || metrics.ambiguityScore > adjustedBest.ambiguityScore) {
      adjustedBest = metrics;
      adjustedCells = cells;
    }
  });
  console.log({ adjustedBest });
  if (adjustedCells) {
    for (let row = 0; row < source.height; row += 1) {
      console.log(adjustedCells.slice(row * source.width, (row + 1) * source.width).map((cell) => symbols[cell]).join(""));
    }
  }
}
