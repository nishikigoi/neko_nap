import { describe, expect, it } from "vitest";
import { createGameState, cycleBed, isComplete, undo } from "../src/game/state";
import type { Level } from "../src/game/types";

const level: Level = {
  id: "state-test", number: 0, width: 2, height: 2, catCount: 2, difficulty: "N0", title: "test",
  cells: ["bed", "floor", "floor", "bed"],
};

describe("ゲーム状態", () => {
  it("寝床を 空→猫→×→空 の順に切り替える", () => {
    let state = createGameState(level, 0);
    state = cycleBed(state, "r0c0");
    expect(state.marks.r0c0).toBe("cat");
    state = cycleBed(state, "r0c0");
    expect(state.marks.r0c0).toBe("cross");
    state = cycleBed(state, "r0c0");
    expect(state.marks.r0c0).toBe("empty");
  });

  it("直前の状態に戻せる", () => {
    const state = cycleBed(createGameState(level, 0), "r0c0");
    expect(undo(state).marks.r0c0).toBe("empty");
  });

  it("指定数の猫が競合せず配置されたときだけクリアになる", () => {
    let state = createGameState(level, 0);
    state = cycleBed(state, "r0c0");
    expect(isComplete(level, state.marks)).toBe(false);
    state = cycleBed(state, "r1c1");
    expect(isComplete(level, state.marks)).toBe(true);
  });
});
