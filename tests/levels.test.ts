import { describe, expect, it } from "vitest";
import { solveLevel } from "../src/game/solver";
import { validateLevel } from "../src/game/validation";
import { levels } from "../src/levels/levels";

describe("ステージデータ", () => {
  it("ステージ1から50まで番号とIDが連続している", () => {
    expect(levels).toHaveLength(50);
    expect(levels.map((level) => level.number)).toEqual(Array.from({ length: 50 }, (_, index) => index + 1));
    expect(new Set(levels.map((level) => level.id)).size).toBe(50);
  });

  it.each(levels)("$id が有効で一意解を持つ", (level) => {
    expect(validateLevel(level)).toEqual([]);
    expect(solveLevel(level).solutionCount).toBe(1);
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
