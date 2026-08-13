import { describe, expect, it } from "vitest";
import { canCompleteLevel, solveLevel } from "../src/game/solver";
import type { Level } from "../src/game/types";

const make = (cells: Level["cells"], catCount: number): Level => ({
  id: "solver-test", number: 0, width: cells.length, height: 1, catCount, difficulty: "N0", title: "test", cells,
});

describe("ソルバー", () => {
  it("解がない盤面を判定する", () => {
    expect(solveLevel(make(["bed", "bed"], 2)).solutionCount).toBe(0);
  });

  it("一意解を判定する", () => {
    expect(solveLevel(make(["bed", "furniture", "bed"], 2)).solutionCount).toBe(1);
  });

  it("複数解を2つで打ち切る", () => {
    expect(solveLevel(make(["bed", "floor", "bed", "floor", "bed"], 1)).solutionCount).toBe(2);
  });

  it("指定済みの猫を含む完成解があるか判定する", () => {
    const level = make(["bed", "furniture", "bed"], 2);
    expect(canCompleteLevel(level, [{ row: 0, col: 0 }])).toBe(true);
    expect(canCompleteLevel(level, [{ row: 0, col: 1 }])).toBe(false);
  });
});
