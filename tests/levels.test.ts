import { describe, expect, it } from "vitest";
import { allBeds } from "../src/game/board";
import { evaluateDifficulty } from "../src/game/difficulty";
import { conflicts } from "../src/game/lineOfSight";
import { enumerateSolutions, solveLevel } from "../src/game/solver";
import type { Level } from "../src/game/types";
import { validateLevel } from "../src/game/validation";
import { levels } from "../src/levels/levels";

const metricsCache = new Map<string, ReturnType<typeof evaluateDifficulty>>();
const metricsFor = (level: Level) => {
  const cached = metricsCache.get(level.id);
  if (cached) return cached;
  const metrics = evaluateDifficulty(level);
  metricsCache.set(level.id, metrics);
  return metrics;
};

function furnitureIsActive(level: Level, furnitureIndex: number) {
  const beds = allBeds(level);
  const withoutFurniture: Level = {
    ...level,
    cells: level.cells.map((cell, index) => index === furnitureIndex ? "floor" : cell),
  };
  return beds.some((a, index) => beds.slice(index + 1).some((b) =>
    conflicts(level, a, b) !== conflicts(withoutFurniture, a, b)));
}

describe("ステージデータ", () => {
  it("ステージ1から50まで番号とIDが連続している", () => {
    expect(levels).toHaveLength(50);
    expect(levels.map((level) => level.number)).toEqual(Array.from({ length: 50 }, (_, index) => index + 1));
    expect(new Set(levels.map((level) => level.id)).size).toBe(50);
  });

  it.each(levels)("$id が許容された数の解を持つ", (level) => {
    expect(validateLevel(level)).toEqual([]);
    const policy = level.solutionPolicy ?? { min: 1, max: 1 };
    const solutionCount = solveLevel(level, policy.max + 1).solutionCount;
    expect(solutionCount).toBeGreaterThanOrEqual(policy.min);
    expect(solutionCount).toBeLessThanOrEqual(policy.max);
  });

  it("ステージ10は異なる行・列配分を持つ4つの解がある", () => {
    const level = levels[9];
    const solutions = enumerateSolutions(level, 5);
    const profiles = (axis: "row" | "col", length: number) => new Set(solutions.map((solution) => {
      const counts = Array<number>(length).fill(0);
      for (const position of solution) counts[position[axis]] += 1;
      return counts.join(",");
    }));
    expect(level.solutionPolicy).toEqual({ min: 4, max: 4 });
    expect(solutions).toHaveLength(4);
    expect(profiles("row", level.height).size).toBe(2);
    expect(profiles("col", level.width).size).toBe(2);
  });

  it("ステージ11から50は表示スコアでも厳密な昇順になる", () => {
    const scores = levels.slice(10).map((level) => Number(metricsFor(level).difficultyScore.toFixed(2)));
    for (let index = 1; index < scores.length; index += 1) {
      expect(scores[index]).toBeGreaterThan(scores[index - 1]);
    }
    expect(scores[0]).toBeGreaterThan(metricsFor(levels[9]).difficultyScore);
    expect(scores.at(-2)).toBeLessThan(scores.at(-1)!);
  }, 30_000);

  it("再生成したステージ11から49は家具が働き、列挙が完了している", () => {
    const generated = levels.slice(10, 49);
    expect(new Set(generated.map((level) => `${level.width}x${level.height}:${level.cells.join("")}`)).size)
      .toBe(generated.length);

    for (const level of generated) {
      const metrics = metricsFor(level);
      expect(metrics.furnitureCount).toBeGreaterThan(0);
      expect(metrics.solutionUsesSeparatedPair).toBe(true);
      expect(metrics.wrongBeds.wrongBedCount).toBeGreaterThan(0);
      expect(metrics.oneMoveBefore.truncated).toBe(false);
      expect(metrics.twoMovesBefore.truncated).toBe(false);
      level.cells.forEach((cell, index) => {
        if (cell === "furniture") expect(furnitureIsActive(level, index)).toBe(true);
      });
    }
  }, 30_000);

  it("ステージ11から19は配分の異なる複数解を持つ", () => {
    for (const level of levels.slice(10, 19)) {
      const metrics = metricsFor(level);
      expect(metrics.solutionCount).toBeGreaterThanOrEqual(4);
      expect(metrics.solutionColumnProfileCount).toBeGreaterThanOrEqual(2);
      expect(metrics.solutionRowProfileCount).toBeGreaterThanOrEqual(2);
    }
  });

  it("ステージ20から49は一意解で、全誤答が完成直前まで残る", () => {
    for (const level of levels.slice(19, 49)) {
      const metrics = metricsFor(level);
      expect(metrics.solutionCount).toBe(1);
      expect(metrics.wrongBeds.lateContradictionRatio).toBe(1);
      expect(metrics.uniqueSolution.peelingRounds).toBeGreaterThanOrEqual(2);
    }
  });

  it("ステージ50は通常の家具だけを使う一意解の長期連鎖問題である", () => {
    const level = levels[49];
    const metrics = metricsFor(level);
    const cells = new Set(level.cells);

    expect(level.solutionPolicy).toEqual({ min: 1, max: 1 });
    expect(level.pacing).toBe("finale");
    expect(metrics.solutionCount).toBe(1);
    expect(cells.has("furniture")).toBe(true);
    expect(level.cells.every((cell) => cell === "floor" || cell === "bed" || cell === "furniture")).toBe(true);
    expect(metrics.uniqueSolution.peelingRounds).toBeGreaterThanOrEqual(6);
    expect(metrics.uniqueSolution.peelingRoundSizes[0]).toBeLessThanOrEqual(2);
    expect(metrics.uniqueSolution.oneMoveBeforeDeadEndCount).toBeGreaterThanOrEqual(700);
    expect(metrics.uniqueSolution.twoMovesBeforeDeadEndCount).toBeGreaterThanOrEqual(11_000);
    expect(metrics.wrongBeds.lateContradictionCount).toBeGreaterThanOrEqual(28);
    expect(metrics.wrongBeds.lateContradictionRatio).toBe(1);
    expect(metrics.oneMoveBefore.truncated).toBe(false);
    expect(metrics.twoMovesBefore.truncated).toBe(false);
    expect(metrics.difficultyScore).toBeGreaterThan(
      Math.max(...levels.slice(0, 49).map((candidate) => metricsFor(candidate).difficultyScore)),
    );
    expect(metrics.difficultyScore).toBeGreaterThanOrEqual(94);
    expect(metrics.difficultyScore).toBeLessThan(96);
  }, 30_000);

  it("ステージ11から50に警告あり・なしの両タイプが混在する", () => {
    const warningCounts = levels.slice(10).map((level) => metricsFor(level).warnings.length);
    expect(warningCounts.some((count) => count > 0)).toBe(true);
    expect(warningCounts.some((count) => count === 0)).toBe(true);
  });
});
