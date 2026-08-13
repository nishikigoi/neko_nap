import { describe, expect, it } from "vitest";
import { evaluateDifficulty } from "../src/game/difficulty";
import { enumerateSolutions, solveLevel } from "../src/game/solver";
import { validateLevel } from "../src/game/validation";
import { levels } from "../src/levels/levels";

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

  it("ステージ20は3種類の遮蔽物と完成直前の罠を持つ一意解問題である", () => {
    const metrics = evaluateDifficulty(levels[19]);

    expect(metrics.solutionCount).toBe(1);
    const cells = new Set(levels[19].cells);
    expect(cells.has("furniture")).toBe(true);
    expect(cells.has("vertical-barrier")).toBe(true);
    expect(cells.has("horizontal-barrier")).toBe(true);
    expect(metrics.oneMoveBefore.placementCount).toBeGreaterThanOrEqual(19);
    expect(metrics.oneMoveBefore.columnProfileCount).toBeGreaterThanOrEqual(5);
    expect(metrics.oneMoveBefore.rowProfileCount).toBeGreaterThanOrEqual(4);
    expect(metrics.wrongBeds.wrongBedCount).toBeGreaterThanOrEqual(8);
    expect(metrics.wrongBeds.lateContradictionCount).toBe(metrics.wrongBeds.wrongBedCount);
  });

  it("ステージ11から50は評価スコアが降順にならない", () => {
    const scores = levels.filter((level) => level.number >= 11 && level.number !== 20 && level.number !== 50)
      .map((level) => evaluateDifficulty(level).ambiguityScore);
    for (let index = 1; index < scores.length; index += 1) {
      expect(scores[index]).toBeGreaterThanOrEqual(scores[index - 1] - Number.EPSILON);
    }
  });

  it("ステージ50は方向別土管を使う一意解の長期連鎖問題である", () => {
    const level = levels[49];
    const metrics = evaluateDifficulty(level);
    const cells = new Set(level.cells);

    expect(level.solutionPolicy).toEqual({ min: 1, max: 1 });
    expect(level.pacing).toBe("finale");
    expect(metrics.solutionCount).toBe(1);
    expect(cells.has("furniture")).toBe(true);
    expect(cells.has("vertical-barrier")).toBe(true);
    expect(cells.has("horizontal-barrier")).toBe(true);
    expect(metrics.uniqueSolution.peelingRounds).toBeGreaterThanOrEqual(6);
    expect(metrics.uniqueSolution.peelingRoundSizes[0]).toBeLessThanOrEqual(2);
    expect(metrics.uniqueSolution.oneMoveBeforeDeadEndCount).toBeGreaterThanOrEqual(700);
    expect(metrics.uniqueSolution.twoMovesBeforeDeadEndCount).toBeGreaterThanOrEqual(11_000);
    expect(metrics.wrongBeds.lateContradictionCount).toBeGreaterThanOrEqual(28);
    expect(metrics.wrongBeds.lateContradictionRatio).toBe(1);
    expect(metrics.oneMoveBefore.truncated).toBe(false);
    expect(metrics.twoMovesBefore.truncated).toBe(false);
  });

  it("ステージ11から50に警告あり・なしの両タイプが混在する", () => {
    const warningCounts = levels.slice(10).map((level) => evaluateDifficulty(level).warnings.length);
    expect(warningCounts.some((count) => count > 0)).toBe(true);
    expect(warningCounts.some((count) => count === 0)).toBe(true);
  });
});
