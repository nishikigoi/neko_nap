import { describe, expect, it } from "vitest";
import { conflicts } from "../src/game/lineOfSight";
import type { CellKind, Level } from "../src/game/types";

const level = (rows: string[]): Level => ({
  id: "test",
  number: 0,
  width: rows[0].length,
  height: rows.length,
  catCount: 2,
  difficulty: "N0",
  title: "test",
  cells: rows.join("").split("").map((cell): CellKind => {
    if (cell === "F") return "furniture";
    if (cell === "V") return "vertical-barrier";
    if (cell === "H") return "horizontal-barrier";
    return cell === "B" ? "bed" : "floor";
  }),
});

describe("視線判定", () => {
  it("同じ行で家具がなければ競合する", () => {
    expect(conflicts(level(["B.B"]), { row: 0, col: 0 }, { row: 0, col: 2 })).toBe(true);
  });

  it("同じ列で家具がなければ競合する", () => {
    expect(conflicts(level(["B", ".", "B"]), { row: 0, col: 0 }, { row: 2, col: 0 })).toBe(true);
  });

  it("家具は視線を遮る", () => {
    expect(conflicts(level(["BFB"]), { row: 0, col: 0 }, { row: 0, col: 2 })).toBe(false);
  });

  it("縦遮蔽物は縦方向だけを遮る", () => {
    expect(conflicts(level(["B", "V", "B"]), { row: 0, col: 0 }, { row: 2, col: 0 })).toBe(false);
    expect(conflicts(level(["BVB"]), { row: 0, col: 0 }, { row: 0, col: 2 })).toBe(true);
  });

  it("横遮蔽物は横方向だけを遮る", () => {
    expect(conflicts(level(["B", "H", "B"]), { row: 0, col: 0 }, { row: 2, col: 0 })).toBe(true);
    expect(conflicts(level(["BHB"]), { row: 0, col: 0 }, { row: 0, col: 2 })).toBe(false);
  });

  it("斜め方向は競合しない", () => {
    expect(conflicts(level(["B.", ".B"]), { row: 0, col: 0 }, { row: 1, col: 1 })).toBe(false);
  });
});
