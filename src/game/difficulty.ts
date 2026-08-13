import { allBeds, positionKey } from "./board";
import { conflicts } from "./lineOfSight";
import { enumerateSolutions, solveLevel } from "./solver";
import type { Level, Position } from "./types";

export interface PartialPlacementMetrics {
  size: number;
  placementCount: number;
  rowProfileCount: number;
  columnProfileCount: number;
  jointProfileCount: number;
  maxPlacementsPerRowProfile: number;
  maxPlacementsPerColumnProfile: number;
  maxPlacementsPerJointProfile: number;
  truncated: boolean;
}

export interface WrongBedMetrics {
  wrongBedCount: number;
  lateContradictionCount: number;
  lateContradictionRatio: number;
  averagePlacementDeficit: number;
  maximumReachableCatsByBed: Record<string, number>;
}

export interface DifficultyMetrics {
  levelId: string;
  bedCount: number;
  furnitureCount: number;
  catCount: number;
  solutionCount: number;
  solutionRowProfileCount: number;
  solutionColumnProfileCount: number;
  solutionUsesSeparatedPair: boolean;
  axisCapacity: {
    rowCapacities: number[];
    columnCapacities: number[];
    rowCapacitySlack: number;
    columnCapacitySlack: number;
    rowAllocationCount: number;
    columnAllocationCount: number;
  };
  oneMoveBefore: PartialPlacementMetrics;
  twoMovesBefore: PartialPlacementMetrics;
  wrongBeds: WrongBedMetrics;
  ambiguityScore: number;
  warnings: string[];
}

interface EnumeratedPlacements {
  placements: Position[][];
  truncated: boolean;
}

const DEFAULT_ENUMERATION_LIMIT = 100_000;

function profile(positions: Position[], length: number, axis: "row" | "col") {
  const counts = Array<number>(length).fill(0);
  for (const position of positions) counts[position[axis]] += 1;
  return counts.join(",");
}

function maxBucketSize(values: string[]) {
  const buckets = new Map<string, number>();
  for (const value of values) buckets.set(value, (buckets.get(value) ?? 0) + 1);
  return Math.max(0, ...buckets.values());
}

function enumerateIndependentSets(
  level: Level,
  size: number,
  required: Position[] = [],
  limit = DEFAULT_ENUMERATION_LIMIT,
): EnumeratedPlacements {
  if (size < 0 || required.length > size) return { placements: [], truncated: false };
  if (required.some((a, index) => required.slice(index + 1).some((b) => conflicts(level, a, b)))) {
    return { placements: [], truncated: false };
  }

  const requiredKeys = new Set(required.map(positionKey));
  const candidates = allBeds(level).filter((bed) => !requiredKeys.has(positionKey(bed)));
  const placements: Position[][] = [];
  let truncated = false;

  function search(index: number, chosen: Position[]) {
    if (placements.length >= limit) {
      truncated = true;
      return;
    }
    const combinedCount = required.length + chosen.length;
    if (combinedCount === size) {
      placements.push([...required, ...chosen]);
      return;
    }
    if (index >= candidates.length || combinedCount + candidates.length - index < size) return;

    const candidate = candidates[index];
    if (![...required, ...chosen].some((other) => conflicts(level, candidate, other))) {
      search(index + 1, [...chosen, candidate]);
    }
    search(index + 1, chosen);
  }

  search(0, []);
  return { placements, truncated };
}

function summarizePlacements(level: Level, size: number): PartialPlacementMetrics {
  const { placements, truncated } = enumerateIndependentSets(level, size);
  const rowProfiles = placements.map((entry) => profile(entry, level.height, "row"));
  const columnProfiles = placements.map((entry) => profile(entry, level.width, "col"));
  const jointProfiles = rowProfiles.map((row, index) => `${row}|${columnProfiles[index]}`);

  return {
    size,
    placementCount: placements.length,
    rowProfileCount: new Set(rowProfiles).size,
    columnProfileCount: new Set(columnProfiles).size,
    jointProfileCount: new Set(jointProfiles).size,
    maxPlacementsPerRowProfile: maxBucketSize(rowProfiles),
    maxPlacementsPerColumnProfile: maxBucketSize(columnProfiles),
    maxPlacementsPerJointProfile: maxBucketSize(jointProfiles),
    truncated,
  };
}

function maximumIndependentSetWithBed(level: Level, bed: Position) {
  for (let size = level.catCount; size >= 1; size -= 1) {
    const result = enumerateIndependentSets(level, size, [bed], 1);
    if (result.placements.length > 0) return size;
  }
  return 0;
}

function hasFurnitureBetween(level: Level, a: Position, b: Position) {
  if (a.row !== b.row && a.col !== b.col) return false;
  const rowStep = Math.sign(b.row - a.row);
  const colStep = Math.sign(b.col - a.col);
  let row = a.row + rowStep;
  let col = a.col + colStep;
  while (row !== b.row || col !== b.col) {
    if (level.cells[row * level.width + col] === "furniture") return true;
    row += rowStep;
    col += colStep;
  }
  return false;
}

function lineCapacities(level: Level, axis: "row" | "col") {
  const lineCount = axis === "row" ? level.height : level.width;
  const lineLength = axis === "row" ? level.width : level.height;

  return Array.from({ length: lineCount }, (_, line) => {
    let capacity = 0;
    let segmentHasBed = false;
    for (let offset = 0; offset < lineLength; offset += 1) {
      const row = axis === "row" ? line : offset;
      const col = axis === "row" ? offset : line;
      const cell = level.cells[row * level.width + col];
      if (cell === "furniture") {
        if (segmentHasBed) capacity += 1;
        segmentHasBed = false;
      } else if (cell === "bed") {
        segmentHasBed = true;
      }
    }
    if (segmentHasBed) capacity += 1;
    return capacity;
  });
}

function allocationCount(capacities: number[], total: number) {
  let counts = Array<number>(total + 1).fill(0);
  counts[0] = 1;
  for (const capacity of capacities) {
    const next = Array<number>(total + 1).fill(0);
    for (let used = 0; used <= total; used += 1) {
      for (let amount = 0; amount <= capacity && used + amount <= total; amount += 1) {
        next[used + amount] += counts[used];
      }
    }
    counts = next;
  }
  return counts[total];
}

export function evaluateDifficulty(level: Level): DifficultyMetrics {
  const solutionPolicy = level.solutionPolicy ?? { min: 1, max: 1 };
  const solutions = enumerateSolutions(level, solutionPolicy.max + 1);
  const solved = solveLevel(level, solutionPolicy.max + 1);
  const solution = solutions[0] ?? [];
  const solutionKeys = new Set(solutions.flat().map(positionKey));
  const solutionRowProfiles = new Set(solutions.map((entry) => profile(entry, level.height, "row")));
  const solutionColumnProfiles = new Set(solutions.map((entry) => profile(entry, level.width, "col")));
  const wrongBeds = allBeds(level).filter((bed) => !solutionKeys.has(positionKey(bed)));
  const maximumReachableCatsByBed = Object.fromEntries(
    wrongBeds.map((bed) => [positionKey(bed), maximumIndependentSetWithBed(level, bed)]),
  );
  const deficits = Object.values(maximumReachableCatsByBed).map((maximum) => level.catCount - maximum);
  const lateContradictionCount = deficits.filter((deficit) => deficit === 1).length;
  const oneMoveBefore = summarizePlacements(level, level.catCount - 1);
  const twoMovesBefore = summarizePlacements(level, level.catCount - 2);
  const solutionUsesSeparatedPair = solution.some((a, index) =>
    solution.slice(index + 1).some((b) => hasFurnitureBetween(level, a, b)),
  );
  const rowCapacities = lineCapacities(level, "row");
  const columnCapacities = lineCapacities(level, "col");
  const rowCapacitySlack = rowCapacities.reduce((sum, value) => sum + value, 0) - level.catCount;
  const columnCapacitySlack = columnCapacities.reduce((sum, value) => sum + value, 0) - level.catCount;
  const rowAllocationCount = allocationCount(rowCapacities, level.catCount);
  const columnAllocationCount = allocationCount(columnCapacities, level.catCount);
  const warnings: string[] = [];

  if (solved.solutionCount < solutionPolicy.min || solved.solutionCount > solutionPolicy.max) {
    warnings.push(`解の数が許容範囲${solutionPolicy.min}〜${solutionPolicy.max}個に収まりません`);
  }
  if (level.solutionPolicy && solutionColumnProfiles.size < 2) warnings.push("正解間で列配分が変化しません");
  if (level.solutionPolicy && solutionRowProfiles.size < 2) warnings.push("正解間で行配分が変化しません");
  if (level.number >= 6 && !solutionUsesSeparatedPair) warnings.push("正解が家具区間を利用していません");
  if (level.number >= 10 && columnAllocationCount < 2) warnings.push("列ごとの猫数が開始時点で一意です");
  if (level.number >= 21 && rowAllocationCount < 2) warnings.push("行ごとの猫数が開始時点で一意です");
  if (level.number >= 10 && oneMoveBefore.columnProfileCount < 2) warnings.push("完成直前の列配分が一意です");
  if (level.number >= 21 && oneMoveBefore.rowProfileCount < 2) warnings.push("完成直前の行配分が一意です");
  if (level.number >= 31 && oneMoveBefore.maxPlacementsPerJointProfile < 2) warnings.push("同じ行列配分に複数配置が残りません");
  if (oneMoveBefore.truncated || twoMovesBefore.truncated) warnings.push("部分配置の列挙上限に達しました");

  const ambiguityScore =
    Math.log2(columnAllocationCount + 1) * 2 +
    Math.log2(rowAllocationCount + 1) * 2 +
    Math.log2(oneMoveBefore.columnProfileCount + 1) * 2 +
    Math.log2(oneMoveBefore.rowProfileCount + 1) * 2 +
    Math.log2(oneMoveBefore.maxPlacementsPerJointProfile + 1) * 3 +
    (wrongBeds.length ? lateContradictionCount / wrongBeds.length : 0) * 4;

  return {
    levelId: level.id,
    bedCount: allBeds(level).length,
    furnitureCount: level.cells.filter((cell) => cell === "furniture").length,
    catCount: level.catCount,
    solutionCount: solved.solutionCount,
    solutionRowProfileCount: solutionRowProfiles.size,
    solutionColumnProfileCount: solutionColumnProfiles.size,
    solutionUsesSeparatedPair,
    axisCapacity: {
      rowCapacities,
      columnCapacities,
      rowCapacitySlack,
      columnCapacitySlack,
      rowAllocationCount,
      columnAllocationCount,
    },
    oneMoveBefore,
    twoMovesBefore,
    wrongBeds: {
      wrongBedCount: wrongBeds.length,
      lateContradictionCount,
      lateContradictionRatio: wrongBeds.length ? lateContradictionCount / wrongBeds.length : 0,
      averagePlacementDeficit: deficits.length
        ? deficits.reduce((sum, deficit) => sum + deficit, 0) / deficits.length
        : 0,
      maximumReachableCatsByBed,
    },
    ambiguityScore,
    warnings,
  };
}
