import { describe, expect, it } from "vitest";
import { defaultSelectedLevel } from "../src/storage/progress";

describe("ステージのデフォルト選択", () => {
  it("初回はステージ1を選択する", () => {
    expect(defaultSelectedLevel([], 1, 50)).toBe(1);
  });

  it("最初の未クリアステージを選択する", () => {
    expect(defaultSelectedLevel([1, 2, 3], 4, 50)).toBe(4);
    expect(defaultSelectedLevel([1, 3], 4, 50)).toBe(2);
  });

  it("選択可能範囲を超えない", () => {
    expect(defaultSelectedLevel([1, 2, 3], 2, 50)).toBe(2);
  });

  it("ステージ50までクリア済みならステージ50を選択する", () => {
    const completedLevels = Array.from({ length: 50 }, (_, index) => index + 1);
    expect(defaultSelectedLevel(completedLevels, 50, 50)).toBe(50);
  });
});
