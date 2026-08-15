import { allBeds, positionKey } from "./board";
import { blocksSight, conflicts } from "./lineOfSight";
import { evaluateFurnitureLayout, type FurnitureLayoutMetrics } from "./furnitureLayout";
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

export interface UniqueSolutionMetrics {
  oneMoveBeforeDeadEndCount: number;
  twoMovesBeforeDeadEndCount: number;
  peelingRounds: number;
  peelingRoundSizes: number[];
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
  furnitureLayout: FurnitureLayoutMetrics;
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
  uniqueSolution: UniqueSolutionMetrics;
  scoreBreakdown: {
    ambiguity: number;
    uniqueDeadEnds: number;
    deductionChain: number;
  };
  difficultyScore: number;
  /** @deprecated 比較用に残している旧スコア。新しい難易度比較には difficultyScore を使う。 */
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
    if (blocksSight(level.cells[row * level.width + col])) return true;
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
      if (blocksSight(cell)) {
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

function lineSegmentIds(level: Level, axis: "row" | "col") {
  const ids = Array<number>(level.cells.length).fill(-1);
  const lineCount = axis === "row" ? level.height : level.width;
  const lineLength = axis === "row" ? level.width : level.height;
  let nextId = 0;
  for (let line = 0; line < lineCount; line += 1) {
    let id = nextId++;
    for (let offset = 0; offset < lineLength; offset += 1) {
      const row = axis === "row" ? line : offset;
      const col = axis === "row" ? offset : line;
      const index = row * level.width + col;
      if (blocksSight(level.cells[index])) id = nextId++;
      else ids[index] = id;
    }
  }
  return ids;
}

function summarizeUniqueSolution(level: Level, solution: Position[], oneMoveBefore: PartialPlacementMetrics, twoMovesBefore: PartialPlacementMetrics): UniqueSolutionMetrics {
  if (solution.length !== level.catCount) {
    return { oneMoveBeforeDeadEndCount: 0, twoMovesBeforeDeadEndCount: 0, peelingRounds: 0, peelingRoundSizes: [] };
  }
  const rowSegments = lineSegmentIds(level, "row");
  const columnSegments = lineSegmentIds(level, "col");
  const edges = allBeds(level).map((bed) => ({
    key: positionKey(bed),
    row: rowSegments[bed.row * level.width + bed.col],
    column: columnSegments[bed.row * level.width + bed.col],
  }));
  const solutionKeys = new Set(solution.map(positionKey));
  const remaining = new Set(edges.map((edge) => edge.key));
  const peelingRoundSizes: number[] = [];

  while (remaining.size > 0) {
    const active = edges.filter((edge) => remaining.has(edge.key));
    const rowDegrees = new Map<number, number>();
    const columnDegrees = new Map<number, number>();
    for (const edge of active) {
      rowDegrees.set(edge.row, (rowDegrees.get(edge.row) ?? 0) + 1);
      columnDegrees.set(edge.column, (columnDegrees.get(edge.column) ?? 0) + 1);
    }
    const forced = active.filter((edge) => solutionKeys.has(edge.key) &&
      (rowDegrees.get(edge.row) === 1 || columnDegrees.get(edge.column) === 1));
    if (forced.length === 0) break;
    peelingRoundSizes.push(forced.length);
    const usedRows = new Set(forced.map((edge) => edge.row));
    const usedColumns = new Set(forced.map((edge) => edge.column));
    for (const edge of active) {
      if (usedRows.has(edge.row) || usedColumns.has(edge.column)) remaining.delete(edge.key);
    }
  }

  return {
    oneMoveBeforeDeadEndCount: Math.max(0, oneMoveBefore.placementCount - level.catCount),
    twoMovesBeforeDeadEndCount: Math.max(0, twoMovesBefore.placementCount - level.catCount * (level.catCount - 1) / 2),
    peelingRounds: peelingRoundSizes.length,
    peelingRoundSizes,
  };
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
  const uniqueSolution = summarizeUniqueSolution(level, solutions.length === 1 ? solution : [], oneMoveBefore, twoMovesBefore);
  const solutionUsesSeparatedPair = solution.some((a, index) =>
    solution.slice(index + 1).some((b) => hasFurnitureBetween(level, a, b)),
  );
  const rowCapacities = lineCapacities(level, "row");
  const columnCapacities = lineCapacities(level, "col");
  const furnitureLayout = evaluateFurnitureLayout(level);
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
  if (furnitureLayout.activeFurnitureCount < furnitureLayout.furnitureCount) warnings.push("視線を分割しない家具があります");
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

  // 一意解では行・列の配分候補が必然的に少なくなり、ambiguityScore だけでは
  // 「終盤まで判明しない誤答」と「確定手の長い連鎖」を過小評価する。
  // 死に筋は盤面サイズに伴って組合せ的に増えるため対数化し、推理の段数は
  // プレイヤーが実際に辿る手順の長さなので線形に加点する。
  const uniqueDeadEnds = solved.solutionCount === 1
    ? Math.log2(uniqueSolution.oneMoveBeforeDeadEndCount + 1) * 2 +
      Math.log2(uniqueSolution.twoMovesBeforeDeadEndCount + 1) * 1.5
    : 0;
  const deductionChain = solved.solutionCount === 1 ? uniqueSolution.peelingRounds * 2 : 0;
  const difficultyScore = ambiguityScore + uniqueDeadEnds + deductionChain;

  return {
    levelId: level.id,
    bedCount: allBeds(level).length,
    furnitureCount: level.cells.filter((cell) => cell === "furniture").length,
    catCount: level.catCount,
    solutionCount: solved.solutionCount,
    solutionRowProfileCount: solutionRowProfiles.size,
    solutionColumnProfileCount: solutionColumnProfiles.size,
    solutionUsesSeparatedPair,
    furnitureLayout,
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
    uniqueSolution,
    scoreBreakdown: {
      ambiguity: ambiguityScore,
      uniqueDeadEnds,
      deductionChain,
    },
    difficultyScore,
    ambiguityScore,
    warnings,
  };
}
