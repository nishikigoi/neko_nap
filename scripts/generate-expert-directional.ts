import { evaluateDifficulty } from "../src/game/difficulty";
import { solveLevel } from "../src/game/solver";
import type { CellKind, Level } from "../src/game/types";

interface Candidate {
  rows: string[];
  cats: number;
  score: number;
  beds: number;
  lateWrongBeds: string;
  oneMoveBefore: number;
  twoMovesBefore: number;
  sameProfile: number;
  peelingRounds: number;
}

function barrierIsActive(level: Level, index: number) {
  const kind = level.cells[index];
  const replacement: CellKind = kind === "vertical-barrier" ? "horizontal-barrier" :
    kind === "horizontal-barrier" ? "vertical-barrier" : "floor";
  const changed = { ...level, cells: level.cells.map((cell, cellIndex) => cellIndex === index ? replacement : cell) };
  return solveLevel(changed, 2).solutionCount !== 1;
}

let seed = 50_021_026;
const random = () => ((seed = (Math.imul(seed, 1_664_525) + 1_013_904_223) >>> 0) / 4_294_967_296);
const shuffle = <T>(values: T[]) => {
  for (let index = values.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [values[index], values[swap]] = [values[swap], values[index]];
  }
  return values;
};

const symbols: Record<CellKind, string> = {
  floor: ".",
  bed: "B",
  furniture: "F",
  "vertical-barrier": "V",
  "horizontal-barrier": "H",
};

const candidates: Candidate[] = [];
const size = 11;
const cats = size;

for (let attempt = 0; attempt < 100 && candidates.length < 10; attempt += 1) {
  const rowOrder = shuffle(Array.from({ length: size }, (_, index) => index));
  const columnOrder = shuffle(Array.from({ length: size }, (_, index) => index));
  const cells = Array<CellKind>(size * size).fill("floor");
  const solutionCells = new Set<number>();

  for (let rank = 0; rank < size; rank += 1) {
    const index = rowOrder[rank] * size + columnOrder[rank];
    cells[index] = "bed";
    solutionCells.add(index);
  }

  for (let left = 0; left < size; left += 1) {
    for (let right = left + 1; right < size; right += 1) {
      const distance = right - left;
      const probability = distance === 1 ? 1 : distance === 2 ? 0.82 : 0.34;
      if (random() < probability) cells[rowOrder[left] * size + columnOrder[right]] = "bed";
    }
  }

  const free = shuffle(cells.map((cell, index) => cell === "floor" ? index : -1).filter((index) => index >= 0));
  const barrierKinds: CellKind[] = ["furniture", "vertical-barrier", "horizontal-barrier"];
  for (let index = 0; index < Math.min(9, free.length); index += 1) cells[free[index]] = barrierKinds[index % 3];

  const level: Level = {
    id: "expert-candidate",
    number: 50,
    width: size,
    height: size,
    catCount: cats,
    difficulty: "N6",
    title: "candidate",
    solutionPolicy: { min: 1, max: 1 },
    cells,
  };
  const metrics = evaluateDifficulty(level);
  if (metrics.solutionCount !== 1) continue;
  if (metrics.oneMoveBefore.truncated || metrics.twoMovesBefore.truncated) continue;
  if (metrics.wrongBeds.lateContradictionRatio < 0.9) continue;
  if (metrics.oneMoveBefore.placementCount < 400) continue;
  if (!["furniture", "vertical-barrier", "horizontal-barrier"].every((kind) => cells.includes(kind as CellKind))) continue;
  const activeDirectionalCount = cells.filter((cell, index) =>
    (cell === "vertical-barrier" || cell === "horizontal-barrier") && barrierIsActive(level, index)).length;
  if (activeDirectionalCount < 2) continue;

  // The planted upper-triangular chain has one newly forced matching edge per logical rank.
  const peelingRounds = metrics.uniqueSolution.peelingRounds;
  candidates.push({
    rows: Array.from({ length: size }, (_, row) =>
      cells.slice(row * size, (row + 1) * size).map((cell) => symbols[cell]).join("")),
    cats,
    score: metrics.ambiguityScore,
    beds: metrics.bedCount,
    lateWrongBeds: `${metrics.wrongBeds.lateContradictionCount}/${metrics.wrongBeds.wrongBedCount}`,
    oneMoveBefore: metrics.oneMoveBefore.placementCount,
    twoMovesBefore: metrics.twoMovesBefore.placementCount,
    sameProfile: metrics.oneMoveBefore.maxPlacementsPerJointProfile,
    peelingRounds,
  });
}

candidates.sort((a, b) => b.oneMoveBefore - a.oneMoveBefore || b.score - a.score);
console.log(JSON.stringify(candidates, null, 2));
console.error(`generated=${candidates.length} best=${candidates[0]?.score}`);
