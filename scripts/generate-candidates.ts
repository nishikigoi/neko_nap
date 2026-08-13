import { evaluateDifficulty } from "../src/game/difficulty";
import { enumerateSolutions } from "../src/game/solver";
import type { CellKind, Level } from "../src/game/types";

let seed = 8_132_026;
const random = () => ((seed = (Math.imul(seed, 1_664_525) + 1_013_904_223) >>> 0) / 4_294_967_296);
const cell = (value: string): CellKind => value === "B" ? "bed" : value === "F" ? "furniture" : "floor";
const candidates: Array<{ rows: string[]; cats: number; solutions: number; score: number; late: number; warnings: string[] }> = [];

for (let attempt = 0; attempt < 2_000_000 && candidates.length < 30; attempt += 1) {
  const width = 7;
  const height = width;
  const cats = width === 7 ? 6 : 7;
  const total = width * height;
  const furnitureCount = width === 7 ? 10 + Math.floor(random() * 9) : 14 + Math.floor(random() * 11);
  const bedCount = width === 7 ? 21 + Math.floor(random() * 8) : 27 + Math.floor(random() * 10);
  const source = Array<string>(total).fill(".");
  const indices = Array.from({ length: total }, (_, index) => index);
  for (let index = indices.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [indices[index], indices[swap]] = [indices[swap], indices[index]];
  }
  for (let index = 0; index < furnitureCount; index += 1) source[indices[index]] = "F";
  for (let index = furnitureCount; index < furnitureCount + bedCount; index += 1) source[indices[index]] = "B";

  const rows = Array.from({ length: height }, (_, row) => source.slice(row * width, (row + 1) * width).join(""));
  const base: Level = {
    id: "candidate",
    number: 20,
    width,
    height,
    catCount: cats,
    difficulty: "N5",
    title: "candidate",
    cells: source.map(cell),
  };
  const solutions = enumerateSolutions(base, 31);
  if (solutions.length < 8 || solutions.length > 30) continue;
  const level = { ...base, solutionPolicy: { min: solutions.length, max: solutions.length } };
  const metrics = evaluateDifficulty(level);
  if (metrics.wrongBeds.lateContradictionCount < 8) continue;
  if (metrics.ambiguityScore < 50) continue;
  candidates.push({
    rows,
    cats,
    solutions: solutions.length,
    score: metrics.ambiguityScore,
    late: metrics.wrongBeds.lateContradictionCount,
    warnings: metrics.warnings,
  });
}

candidates.sort((a, b) => a.score - b.score);
console.log(JSON.stringify(candidates, null, 2));
console.error(`generated=${candidates.length} min=${candidates[0]?.score} max=${candidates.at(-1)?.score}`);
