import { describe, expect, it } from "vitest";
import { solveLevel } from "../src/game/solver";
import { validateLevel } from "../src/game/validation";
import { levels } from "../src/levels/levels";

describe("ステージデータ", () => {
  it.each(levels)("$id が有効で一意解を持つ", (level) => {
    expect(validateLevel(level)).toEqual([]);
    expect(solveLevel(level).solutionCount).toBe(1);
  });
});
