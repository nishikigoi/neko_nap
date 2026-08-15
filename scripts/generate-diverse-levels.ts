import { evaluateDifficulty } from "../src/game/difficulty";
import type { CellKind, Level } from "../src/game/types";

type Arm = "left" | "right" | "top" | "bottom";

interface Layout {
  key: string;
  pattern: "corner" | "horizontal" | "vertical" | "three-sided" | "cross";
  mainSize: number;
  arms: Partial<Record<Arm, number>>;
}

interface Edge {
  block: "main" | Arm;
  row: number;
  column: number;
}

interface Candidate {
  rows: string[];
  catCount: number;
  score: number;
  bedCount: number;
  furnitureCount: number;
  lateContradictions: number;
  peelingRounds: number;
  layout: string;
  pattern: Layout["pattern"];
  orientation: number;
  mainSize: number;
  cutProfile: "horizontal" | "vertical" | "mixed";
}

const layouts: Layout[] = [
  { key: "m5-corner-22", pattern: "corner", mainSize: 5, arms: { right: 2, bottom: 2 } },
  { key: "m5-horizontal-22", pattern: "horizontal", mainSize: 5, arms: { left: 2, right: 2 } },
  { key: "m5-vertical-22", pattern: "vertical", mainSize: 5, arms: { top: 2, bottom: 2 } },
  { key: "m5-three-211", pattern: "three-sided", mainSize: 5, arms: { left: 2, right: 1, bottom: 1 } },
  { key: "m5-cross-1111", pattern: "cross", mainSize: 5, arms: { left: 1, right: 1, top: 1, bottom: 1 } },
  { key: "m5-corner-32", pattern: "corner", mainSize: 5, arms: { right: 3, bottom: 2 } },
  { key: "m5-three-221", pattern: "three-sided", mainSize: 5, arms: { left: 2, right: 2, bottom: 1 } },
  { key: "m6-corner-22", pattern: "corner", mainSize: 6, arms: { right: 2, bottom: 2 } },
  { key: "m6-horizontal-22", pattern: "horizontal", mainSize: 6, arms: { left: 2, right: 2 } },
  { key: "m6-vertical-22", pattern: "vertical", mainSize: 6, arms: { top: 2, bottom: 2 } },
  { key: "m6-three-211", pattern: "three-sided", mainSize: 6, arms: { left: 2, right: 1, bottom: 1 } },
  { key: "m6-cross-1111", pattern: "cross", mainSize: 6, arms: { left: 1, right: 1, top: 1, bottom: 1 } },
  { key: "m6-corner-32", pattern: "corner", mainSize: 6, arms: { right: 3, bottom: 2 } },
  { key: "m6-three-221", pattern: "three-sided", mainSize: 6, arms: { left: 2, right: 2, top: 1 } },
  { key: "m7-corner-22", pattern: "corner", mainSize: 7, arms: { right: 2, bottom: 2 } },
  { key: "m7-horizontal-22", pattern: "horizontal", mainSize: 7, arms: { left: 2, right: 2 } },
  { key: "m7-vertical-22", pattern: "vertical", mainSize: 7, arms: { top: 2, bottom: 2 } },
  { key: "m7-three-211", pattern: "three-sided", mainSize: 7, arms: { left: 2, right: 1, bottom: 1 } },
  { key: "m7-cross-1111", pattern: "cross", mainSize: 7, arms: { left: 1, right: 1, top: 1, bottom: 1 } },
  { key: "m7-corner-33", pattern: "corner", mainSize: 7, arms: { right: 3, bottom: 3 } },
  { key: "m7-three-321", pattern: "three-sided", mainSize: 7, arms: { left: 3, right: 2, bottom: 1 } },
  { key: "m8-corner-32", pattern: "corner", mainSize: 8, arms: { right: 3, bottom: 2 } },
  { key: "m8-three-221", pattern: "three-sided", mainSize: 8, arms: { left: 2, right: 2, top: 1 } },
  { key: "m8-cross-2111", pattern: "cross", mainSize: 8, arms: { left: 2, right: 1, top: 1, bottom: 1 } },
];

const symbols: Record<CellKind, string> = { floor: ".", bed: "B", furniture: "F" };
let randomState = 20_490_731;
const random = () => ((randomState = (Math.imul(randomState, 1_664_525) + 1_013_904_223) >>> 0) / 4_294_967_296);

function hash(value: string) {
  let result = 2_166_136_261;
  for (const character of value) {
    result ^= character.charCodeAt(0);
    result = Math.imul(result, 16_777_619);
  }
  return result >>> 0;
}

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

function rotate(rows: string[]) {
  return Array.from({ length: rows[0].length }, (_, column) =>
    rows.map((_, row) => rows[rows.length - 1 - row][column]).join(""));
}

function transform(rows: string[], orientation: number) {
  let transformed = orientation >= 4 ? rows.map((row) => [...row].reverse().join("")) : [...rows];
  for (let turn = 0; turn < orientation % 4; turn += 1) transformed = rotate(transformed);
  return transformed;
}

function optionalEdges(layout: Layout) {
  const edges: Edge[] = [];
  const addBlock = (block: Edge["block"], size: number) => {
    for (let row = 0; row < size; row += 1) {
      for (let column = row + 1; column < size; column += 1) edges.push({ block, row, column });
    }
  };
  addBlock("main", layout.mainSize);
  for (const arm of ["left", "right", "top", "bottom"] as const) addBlock(arm, layout.arms[arm] ?? 0);
  return edges;
}

function buildCandidate(layout: Layout, includedEdges: Edge[], variant: number): Candidate | undefined {
  randomState = (hash(layout.key) + variant * 65_537 + 20_490_731) >>> 0;
  const armSize = (arm: Arm) => layout.arms[arm] ?? 0;
  const leftSpan = armSize("left") ? armSize("left") + 1 : 0;
  const rightSpan = armSize("right") ? armSize("right") + 1 : 0;
  const topSpan = armSize("top") ? armSize("top") + 1 : 0;
  const bottomSpan = armSize("bottom") ? armSize("bottom") + 1 : 0;
  const width = leftSpan + layout.mainSize + rightSpan;
  const height = topSpan + layout.mainSize + bottomSpan;
  const mainRowOffset = topSpan;
  const mainColumnOffset = leftSpan;
  const cells = Array<CellKind>(width * height).fill("floor");
  const put = (row: number, column: number, kind: CellKind) => cells[row * width + column] = kind;
  const mainRows = permutation(layout.mainSize).map((row) => mainRowOffset + row);
  const mainColumns = permutation(layout.mainSize).map((column) => mainColumnOffset + column);
  const blockRows: Record<Edge["block"], number[]> = { main: mainRows, left: [], right: [], top: [], bottom: [] };
  const blockColumns: Record<Edge["block"], number[]> = { main: mainColumns, left: [], right: [], top: [], bottom: [] };

  for (let index = 0; index < layout.mainSize; index += 1) put(mainRows[index], mainColumns[index], "bed");

  const addHorizontalArm = (arm: "left" | "right") => {
    const size = armSize(arm);
    if (!size) return;
    const rows = shuffle([...mainRows]).slice(0, size);
    const startColumn = arm === "left" ? 0 : mainColumnOffset + layout.mainSize + 1;
    const columns = permutation(size).map((column) => startColumn + column);
    const separatorColumn = arm === "left" ? armSize("left") : mainColumnOffset + layout.mainSize;
    blockRows[arm] = rows;
    blockColumns[arm] = columns;
    for (let index = 0; index < size; index += 1) {
      put(rows[index], separatorColumn, "furniture");
      put(rows[index], columns[index], "bed");
    }
  };

  const addVerticalArm = (arm: "top" | "bottom") => {
    const size = armSize(arm);
    if (!size) return;
    const rowsStart = arm === "top" ? 0 : mainRowOffset + layout.mainSize + 1;
    const rows = permutation(size).map((row) => rowsStart + row);
    const columns = shuffle([...mainColumns]).slice(0, size);
    const separatorRow = arm === "top" ? armSize("top") : mainRowOffset + layout.mainSize;
    blockRows[arm] = rows;
    blockColumns[arm] = columns;
    for (let index = 0; index < size; index += 1) {
      put(separatorRow, columns[index], "furniture");
      put(rows[index], columns[index], "bed");
    }
  };

  addHorizontalArm("left");
  addHorizontalArm("right");
  addVerticalArm("top");
  addVerticalArm("bottom");

  for (const edge of includedEdges) {
    put(blockRows[edge.block][edge.row], blockColumns[edge.block][edge.column], "bed");
  }

  const orientation = variant % 8;
  const rawRows = Array.from({ length: height }, (_, row) =>
    cells.slice(row * width, (row + 1) * width).map((cell) => symbols[cell]).join(""));
  const rows = transform(rawRows, orientation);
  if (rows.length > rows[0].length) return undefined;
  const transformedCells = rows.join("").split("").map((character): CellKind =>
    character === "B" ? "bed" : character === "F" ? "furniture" : "floor");
  const catCount = layout.mainSize + Object.values(layout.arms).reduce((sum, size) => sum + (size ?? 0), 0);
  const level: Level = {
    id: "diverse-ranked-candidate",
    number: 20,
    width: rows[0].length,
    height: rows.length,
    catCount,
    cells: transformedCells,
    difficulty: "N6",
  };
  const metrics = evaluateDifficulty(level);
  if (metrics.solutionCount !== 1 || !metrics.solutionUsesSeparatedPair) return undefined;
  if (metrics.oneMoveBefore.truncated || metrics.twoMovesBefore.truncated) return undefined;
  if (metrics.wrongBeds.wrongBedCount === 0 || metrics.wrongBeds.lateContradictionRatio !== 1) return undefined;
  if (metrics.uniqueSolution.peelingRounds < 2) return undefined;
  if (metrics.furnitureLayout.activeFurnitureCount !== metrics.furnitureLayout.furnitureCount) return undefined;

  return {
    rows,
    catCount,
    score: metrics.difficultyScore,
    bedCount: metrics.bedCount,
    furnitureCount: metrics.furnitureCount,
    lateContradictions: metrics.wrongBeds.lateContradictionCount,
    peelingRounds: metrics.uniqueSolution.peelingRounds,
    layout: layout.key,
    pattern: layout.pattern,
    orientation,
    mainSize: layout.mainSize,
    cutProfile: metrics.furnitureLayout.horizontalCutCount > 0 && metrics.furnitureLayout.verticalCutCount > 0
      ? "mixed"
      : metrics.furnitureLayout.horizontalCutCount > 0 ? "horizontal" : "vertical",
  };
}

function generateLayout(layout: Layout) {
  const optional = optionalEdges(layout);
  const candidates: Candidate[] = [];
  const boardKeys = new Set<string>();
  for (let order = 0; order < 6; order += 1) {
    randomState = (hash(layout.key) + order * 97_409 + 20_490_731) >>> 0;
    const ordered = shuffle([...optional]);
    for (let count = 1; count <= ordered.length; count += 1) {
      const candidate = buildCandidate(layout, ordered.slice(0, count), order * 100 + count);
      if (!candidate) continue;
      const key = candidate.rows.join("/");
      if (boardKeys.has(key)) continue;
      boardKeys.add(key);
      candidates.push(candidate);
    }
  }
  return candidates.sort((a, b) => a.score - b.score);
}

const pools = layouts.map((layout) => ({ layout, candidates: generateLayout(layout) }));
for (const { layout, candidates } of pools) {
  console.error(
    `${layout.key}: ${candidates.length} candidates, ` +
    `${candidates[0]?.score.toFixed(2)}..${candidates.at(-1)?.score.toFixed(2)}, ` +
    `cats=${candidates[0]?.catCount} furniture=${candidates[0]?.furnitureCount}`,
  );
}

const targetsByMainSize = new Map([
  [5, [46.6, 49.0, 51.5, 54.0, 56.5]],
  [6, [57.4, 59.3, 61.2, 63.0, 64.8]],
  [7, [65.5, 66.5, 67.5, 68.5, 69.5, 70.5, 71.5, 72.5, 73.5, 74.5, 75.5]],
  [8, [76.3, 77.1, 77.9, 78.7, 79.5, 80.3, 81.1, 81.9, 82.6]],
]);

function chooseSequence() {
  const allCandidates = pools.flatMap(({ candidates }) => candidates);
  const selected: Array<Candidate & { stage: number }> = [];
  const usedBoards = new Set<string>();
  let previousScore = 45.66;
  let stage = 20;

  for (const [mainSize, targets] of targetsByMainSize) {
    for (const target of targets) {
      const recent = selected.slice(-5);
      const previous = selected.at(-1);
      const eligible = allCandidates.filter((candidate) => {
        const rounded = Number(candidate.score.toFixed(2));
        return candidate.mainSize === mainSize &&
          rounded > Number(previousScore.toFixed(2)) &&
          !usedBoards.has(candidate.rows.join("/")) &&
          candidate.pattern !== previous?.pattern &&
          !(candidate.cutProfile !== "mixed" && candidate.cutProfile === previous?.cutProfile);
      });
      const candidate = eligible.sort((a, b) => {
        const cost = (value: Candidate) =>
          Math.abs(value.score - target) +
          recent.filter((entry) => entry.layout === value.layout).length * 1.2 +
          recent.filter((entry) => entry.pattern === value.pattern).length * .35 +
          (previous?.orientation === value.orientation ? .3 : 0);
        return cost(a) - cost(b) || a.score - b.score;
      })[0];
      if (!candidate) throw new Error(`ステージ${stage}の候補がありません`);
      usedBoards.add(candidate.rows.join("/"));
      previousScore = candidate.score;
      selected.push({ ...candidate, stage });
      stage += 1;
    }
  }
  return selected;
}

for (const candidate of chooseSequence()) {
  console.log(
    `[${candidate.stage}, ${candidate.catCount}, 1, "${candidate.rows.join("/")}"], ` +
    `// ${candidate.score.toFixed(2)} beds=${candidate.bedCount} furniture=${candidate.furnitureCount} ` +
    `late=${candidate.lateContradictions} peeling=${candidate.peelingRounds} ` +
    `${candidate.layout} orientation=${candidate.orientation} cuts=${candidate.cutProfile}`,
  );
}
