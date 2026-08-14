import { evaluateDifficulty } from "../src/game/difficulty";
import { enumerateSolutions } from "../src/game/solver";
import type { CellKind, Level } from "../src/game/types";

interface Edge {
  block: "main" | "side";
  row: number;
  column: number;
}

interface Family {
  stageStart: number;
  stageCount: number;
  mainSize: number;
  sideSize: number;
  targetStart: number;
  targetEnd: number;
}

interface Candidate {
  rows: string[];
  catCount: number;
  score: number;
  solutionCount: number;
  bedCount: number;
  furnitureCount: number;
  lateContradictions: number;
  peelingRounds: number;
}

const families: Family[] = [
  { stageStart: 20, stageCount: 5, mainSize: 5, sideSize: 2, targetStart: 46.5, targetEnd: 53.5 },
  { stageStart: 25, stageCount: 5, mainSize: 6, sideSize: 2, targetStart: 54.5, targetEnd: 62.5 },
  { stageStart: 30, stageCount: 5, mainSize: 7, sideSize: 2, targetStart: 63.5, targetEnd: 72.5 },
  { stageStart: 35, stageCount: 6, mainSize: 8, sideSize: 2, targetStart: 73.0, targetEnd: 81.5 },
  { stageStart: 41, stageCount: 9, mainSize: 9, sideSize: 1, targetStart: 82.0, targetEnd: 90.4 },
];

const symbols: Record<CellKind, string> = { floor: ".", bed: "B", furniture: "F" };
let randomState = 11_049_050;
const random = () => ((randomState = (Math.imul(randomState, 1_664_525) + 1_013_904_223) >>> 0) / 4_294_967_296);

function shuffle<T>(values: T[]) {
  for (let index = values.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [values[index], values[swap]] = [values[swap], values[index]];
  }
  return values;
}

function permutation(size: number) {
  return shuffle(Array.from({ length: size }, (_, index) => index));
}

function furnitureIsActive(cells: CellKind[], width: number, height: number, index: number) {
  const originRow = Math.floor(index / width);
  const originColumn = index % width;
  const seesBed = (rowStep: number, columnStep: number) => {
    let row = originRow + rowStep;
    let column = originColumn + columnStep;
    while (row >= 0 && row < height && column >= 0 && column < width) {
      const cell = cells[row * width + column];
      if (cell === "furniture") return false;
      if (cell === "bed") return true;
      row += rowStep;
      column += columnStep;
    }
    return false;
  };
  return seesBed(0, -1) && seesBed(0, 1) || seesBed(-1, 0) && seesBed(1, 0);
}

function pruneInactiveFurniture(cells: CellKind[], width: number, height: number) {
  while (true) {
    const inactive = cells.findIndex((cell, index) =>
      cell === "furniture" && !furnitureIsActive(cells, width, height, index));
    if (inactive < 0) return;
    cells[inactive] = "floor";
  }
}

function optionalEdges(mainSize: number, sideSize: number): Edge[] {
  const edges: Edge[] = [];
  for (let row = 0; row < mainSize; row += 1) {
    for (let column = row + 1; column < mainSize; column += 1) {
      edges.push({ block: "main", row, column });
    }
  }
  for (let row = 0; row < sideSize; row += 1) {
    for (let column = row + 1; column < sideSize; column += 1) {
      edges.push({ block: "side", row, column });
    }
  }
  return edges;
}

function buildCandidate(family: Family, includedEdges: Edge[], variant: number): Candidate | undefined {
  randomState = (family.mainSize * 100_003 + family.sideSize * 9_973 + variant * 65_537 + 11_049_050) >>> 0;
  const width = family.mainSize + family.sideSize + 1;
  const height = family.mainSize;
  const cells = Array<CellKind>(width * height).fill("floor");
  const mainRows = permutation(family.mainSize);
  const mainColumns = permutation(family.mainSize);
  const sideRows = mainRows.slice(0, family.sideSize);
  const sideColumns = permutation(family.sideSize).map((column) => family.mainSize + 1 + column);
  const putBed = (row: number, column: number) => cells[row * width + column] = "bed";

  for (let index = 0; index < family.mainSize; index += 1) {
    putBed(mainRows[index], mainColumns[index]);
  }
  for (let index = 0; index < family.sideSize; index += 1) {
    putBed(sideRows[index], sideColumns[index]);
    cells[sideRows[index] * width + family.mainSize] = "furniture";
  }
  for (const edge of includedEdges) {
    if (edge.block === "main") putBed(mainRows[edge.row], mainColumns[edge.column]);
    else putBed(sideRows[edge.row], sideColumns[edge.column]);
  }

  const catCount = family.mainSize + family.sideSize;
  const level: Level = {
    id: "ranked-candidate",
    number: family.stageStart,
    width,
    height,
    catCount,
    cells,
    title: "candidate",
    difficulty: "N6",
  };
  const metrics = evaluateDifficulty(level);
  if (metrics.solutionCount !== 1 || !metrics.solutionUsesSeparatedPair) return undefined;
  if (metrics.oneMoveBefore.truncated || metrics.twoMovesBefore.truncated) return undefined;
  if (metrics.wrongBeds.wrongBedCount === 0 || metrics.wrongBeds.lateContradictionRatio !== 1) return undefined;

  return {
    rows: Array.from({ length: height }, (_, row) =>
      cells.slice(row * width, (row + 1) * width).map((cell) => symbols[cell]).join("")),
    catCount,
    score: metrics.difficultyScore,
    solutionCount: metrics.solutionCount,
    bedCount: metrics.bedCount,
    furnitureCount: metrics.furnitureCount,
    lateContradictions: metrics.wrongBeds.lateContradictionCount,
    peelingRounds: metrics.uniqueSolution.peelingRounds,
  };
}

function generateFamily(family: Family) {
  const optional = optionalEdges(family.mainSize, family.sideSize);
  const candidates: Candidate[] = [];
  const boardKeys = new Set<string>();
  const add = (edges: Edge[], variant: number) => {
    const candidate = buildCandidate(family, edges, variant);
    if (!candidate) return;
    const key = candidate.rows.join("/");
    if (boardKeys.has(key)) return;
    boardKeys.add(key);
    candidates.push(candidate);
  };

  if (optional.length <= 12) {
    for (let mask = 1; mask < 2 ** optional.length; mask += 1) {
      add(optional.filter((_, index) => (mask & 2 ** index) !== 0), mask);
    }
  } else {
    for (let order = 0; order < 18; order += 1) {
      randomState = (family.mainSize * 1_000_003 + order * 97_409 + 11_049_050) >>> 0;
      const ordered = shuffle([...optional]);
      for (let count = 1; count <= ordered.length; count += 1) add(ordered.slice(0, count), order * 100 + count);
    }
  }

  return candidates.sort((a, b) => a.score - b.score || a.rows.join("/").localeCompare(b.rows.join("/")));
}

function generateMultipleSolutionCandidates() {
  const candidates: Candidate[] = [];
  const boardKeys = new Set<string>();
  randomState = 11_019_050;
  for (let attempt = 0; attempt < 600_000 && candidates.length < 180; attempt += 1) {
    const size = 6;
    const total = size * size;
    const cells = Array<CellKind>(total).fill("floor");
    const indices = shuffle(Array.from({ length: total }, (_, index) => index));
    const furnitureCount = 7 + Math.floor(random() * 8);
    const bedCount = 15 + Math.floor(random() * 4);
    if (furnitureCount + bedCount > total) continue;
    for (let index = 0; index < furnitureCount; index += 1) cells[indices[index]] = "furniture";
    for (let index = furnitureCount; index < furnitureCount + bedCount; index += 1) cells[indices[index]] = "bed";
    pruneInactiveFurniture(cells, size, size);

    const base: Level = {
      id: "ranked-multiple-candidate",
      number: 11,
      width: size,
      height: size,
      catCount: 5,
      cells,
      title: "candidate",
      difficulty: "N4",
    };
    const solutions = enumerateSolutions(base, 17);
    if (solutions.length < 4 || solutions.length > 16) continue;
    const metrics = evaluateDifficulty({
      ...base,
      solutionPolicy: { min: solutions.length, max: solutions.length },
    });
    if (metrics.warnings.length > 0 || !metrics.solutionUsesSeparatedPair) continue;
    if (metrics.solutionRowProfileCount < 2 || metrics.solutionColumnProfileCount < 2) continue;
    if (metrics.oneMoveBefore.truncated || metrics.twoMovesBefore.truncated) continue;
    if (metrics.wrongBeds.wrongBedCount < 3 ||
      metrics.wrongBeds.lateContradictionCount < Math.floor(metrics.wrongBeds.wrongBedCount / 2)) continue;

    const rows = Array.from({ length: size }, (_, row) =>
      cells.slice(row * size, (row + 1) * size).map((cell) => symbols[cell]).join(""));
    const key = rows.join("/");
    if (boardKeys.has(key)) continue;
    boardKeys.add(key);
    candidates.push({
      rows,
      catCount: 5,
      score: metrics.difficultyScore,
      solutionCount: metrics.solutionCount,
      bedCount: metrics.bedCount,
      furnitureCount: metrics.furnitureCount,
      lateContradictions: metrics.wrongBeds.lateContradictionCount,
      peelingRounds: 0,
    });
  }
  return candidates.sort((a, b) => a.score - b.score || a.rows.join("/").localeCompare(b.rows.join("/")));
}

function chooseFromPool(
  pool: Candidate[],
  stageStart: number,
  stageCount: number,
  targetStart: number,
  targetEnd: number,
  previousScore: number,
) {
  const selected: Array<Candidate & { stage: number }> = [];
  const used = new Set<string>();
  for (let offset = 0; offset < stageCount; offset += 1) {
    const ratio = stageCount === 1 ? 0 : offset / (stageCount - 1);
    const target = targetStart + (targetEnd - targetStart) * ratio;
    const eligible = pool.filter((candidate) => {
      const rounded = Number(candidate.score.toFixed(2));
      return rounded > Number(previousScore.toFixed(2)) && !used.has(candidate.rows.join("/"));
    });
    const candidate = eligible.sort((a, b) =>
      Math.abs(a.score - target) - Math.abs(b.score - target) || a.score - b.score)[0];
    if (!candidate) throw new Error(`ステージ${stageStart + offset}の候補がありません`);
    used.add(candidate.rows.join("/"));
    previousScore = candidate.score;
    selected.push({ ...candidate, stage: stageStart + offset });
  }
  return selected;
}

function chooseCandidates() {
  const multiplePool = generateMultipleSolutionCandidates();
  console.error(
    `stages 11-19: ${multiplePool.length} candidates, ` +
    `${multiplePool[0]?.score.toFixed(2)}..${multiplePool.at(-1)?.score.toFixed(2)}`,
  );
  const selected = chooseFromPool(multiplePool, 11, 9, 34.0, 45.5, 31.48);
  let previousScore = 31.48;
  previousScore = selected.at(-1)?.score ?? previousScore;
  for (const family of families) {
    const pool = generateFamily(family);
    console.error(
      `stages ${family.stageStart}-${family.stageStart + family.stageCount - 1}: ${pool.length} candidates, ` +
      `${pool[0]?.score.toFixed(2)}..${pool.at(-1)?.score.toFixed(2)}`,
    );
    const chosen = chooseFromPool(
      pool,
      family.stageStart,
      family.stageCount,
      family.targetStart,
      family.targetEnd,
      previousScore,
    );
    selected.push(...chosen);
    previousScore = chosen.at(-1)?.score ?? previousScore;
  }
  return selected;
}

const selected = chooseCandidates();
for (const candidate of selected) {
  console.log(
    `[${candidate.stage}, ${candidate.catCount}, ${candidate.solutionCount}, ` +
    `"${candidate.rows.join("/")}"], // ${candidate.score.toFixed(2)} ` +
    `beds=${candidate.bedCount} furniture=${candidate.furnitureCount} ` +
    `late=${candidate.lateContradictions} peeling=${candidate.peelingRounds}`,
  );
}
