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

  it("ステージ20は配分候補と完成直前の罠を十分に持つ", () => {
    const metrics = evaluateDifficulty(levels[19]);

    expect(metrics.solutionCount).toBe(6);
    expect(metrics.solutionColumnProfileCount).toBeGreaterThanOrEqual(2);
    expect(metrics.solutionRowProfileCount).toBeGreaterThanOrEqual(3);
    expect(metrics.oneMoveBefore.placementCount).toBeGreaterThanOrEqual(50);
    expect(metrics.oneMoveBefore.columnProfileCount).toBeGreaterThanOrEqual(8);
    expect(metrics.oneMoveBefore.rowProfileCount).toBeGreaterThanOrEqual(8);
    expect(metrics.wrongBeds.wrongBedCount).toBeGreaterThanOrEqual(8);
    expect(metrics.wrongBeds.lateContradictionCount).toBe(metrics.wrongBeds.wrongBedCount);
  });

  it.each(levels.filter((level) => level.number >= 6))(
    "$id が家具区間を正解に利用している",
    (level) => {
      const furnitureCount = level.cells.filter((cell) => cell === "furniture").length;
      const solution = solveLevel(level, 1).firstSolution ?? [];
      const hasSeparatedPair = solution.some((a, index) =>
        solution.slice(index + 1).some((b) => {
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
        }),
      );

      expect(furnitureCount).toBeGreaterThanOrEqual(2);
      expect(hasSeparatedPair).toBe(true);
    },
  );
});
