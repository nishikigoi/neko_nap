import { describe, expect, it } from "vitest";
import { evaluateDifficulty } from "../src/game/difficulty";
import type { CellKind, Level } from "../src/game/types";

function makeLevel(rows: string[], catCount: number): Level {
  return {
    id: "difficulty-test",
    number: 10,
    width: rows[0].length,
    height: rows.length,
    catCount,
    title: "test",
    difficulty: "N3",
    cells: rows.join("").split("").map((cell): CellKind =>
      cell === "B" ? "bed" : cell === "F" ? "furniture" : "floor",
    ),
  };
}

describe("人間向け難易度評価", () => {
  it("完成直前に残る行・列配分と同配分内の配置数を数える", () => {
    const metrics = evaluateDifficulty(makeLevel(["BFB", ".F.", "BBB"], 3));

    expect(metrics.oneMoveBefore.placementCount).toBeGreaterThan(0);
    expect(metrics.oneMoveBefore.rowProfileCount).toBeGreaterThan(0);
    expect(metrics.oneMoveBefore.columnProfileCount).toBeGreaterThan(0);
    expect(metrics.oneMoveBefore.jointProfileCount).toBeGreaterThan(0);
  });

  it("家具を挟んで共存する正解を検出する", () => {
    const metrics = evaluateDifficulty(makeLevel(["BFB", ".F.", "BBB"], 3));
    expect(metrics.solutionUsesSeparatedPair).toBe(true);
  });

  it("誤った寝床を選んだとき何匹まで置けるか測定する", () => {
    const metrics = evaluateDifficulty(makeLevel(["BFB", ".F.", "BBB"], 3));
    expect(metrics.wrongBeds.wrongBedCount).toBeGreaterThan(0);
    expect(Object.values(metrics.wrongBeds.maximumReachableCatsByBed).every((count) => count < 3)).toBe(true);
  });

  it("各列の最大収容数から猫数配分が一意になる問題を検出する", () => {
    const metrics = evaluateDifficulty(makeLevel(["B.B", "B.B"], 2));

    expect(metrics.axisCapacity.columnCapacities).toEqual([1, 0, 1]);
    expect(metrics.axisCapacity.columnCapacitySlack).toBe(0);
    expect(metrics.axisCapacity.columnAllocationCount).toBe(1);
    expect(metrics.warnings).toContain("列ごとの猫数が開始時点で一意です");
  });

  it("列の収容数に余裕があれば複数の猫数配分を数える", () => {
    const metrics = evaluateDifficulty(makeLevel(["BFB", "BFB"], 1));

    expect(metrics.axisCapacity.columnCapacities).toEqual([1, 0, 1]);
    expect(metrics.axisCapacity.columnCapacitySlack).toBe(1);
    expect(metrics.axisCapacity.columnAllocationCount).toBe(2);
  });

  it("複数解の盤面で列と行の配分候補を検出する", () => {
    const metrics = evaluateDifficulty(makeLevel(["BBB.B", "BFBFF", "BBB.F", ".....", "..B.F"], 4));

    expect(metrics.oneMoveBefore.columnProfileCount).toBeGreaterThanOrEqual(2);
    expect(metrics.oneMoveBefore.rowProfileCount).toBeGreaterThanOrEqual(2);
  });

  it("一意解では死に筋と確定連鎖を総合難易度へ加点する", () => {
    const metrics = evaluateDifficulty(makeLevel(["B.B", "B.."], 2));

    expect(metrics.scoreBreakdown.uniqueDeadEnds).toBeGreaterThan(0);
    expect(metrics.scoreBreakdown.deductionChain).toBeGreaterThan(0);
    expect(metrics.difficultyScore).toBeCloseTo(
      metrics.scoreBreakdown.ambiguity +
        metrics.scoreBreakdown.uniqueDeadEnds +
        metrics.scoreBreakdown.deductionChain,
    );
    expect(metrics.difficultyScore).toBeGreaterThan(metrics.ambiguityScore);
  });
});
