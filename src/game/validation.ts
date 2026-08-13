import { allBeds, cellAt, positionKey } from "./board";
import { conflicts } from "./lineOfSight";
import { solveLevel } from "./solver";
import type { Level } from "./types";

export function validateLevel(level: Level): string[] {
  const errors: string[] = [];
  const beds = allBeds(level);
  const initial = level.initialCats ?? [];
  if (level.cells.length !== level.width * level.height) errors.push("マス数が盤面サイズと一致しません");
  if (level.catCount <= 0) errors.push("猫の数は1以上でなければなりません");
  if (beds.length < level.catCount) errors.push("寝床の数が猫の数より少ないです");
  if (new Set(initial.map(positionKey)).size !== initial.length) errors.push("初期配置の猫が重複しています");
  if (initial.some((cat) => cellAt(level, cat) !== "bed")) errors.push("初期配置の猫が寝床以外にいます");
  if (initial.some((cat, index) => initial.slice(index + 1).some((b) => conflicts(level, cat, b)))) {
    errors.push("初期配置の猫が競合しています");
  }
  const solutionPolicy = level.solutionPolicy ?? { min: 1, max: 1 };
  const solutionCount = solveLevel(level, solutionPolicy.max + 1).solutionCount;
  if (solutionCount < solutionPolicy.min || solutionCount > solutionPolicy.max) {
    errors.push(`解の数が許容範囲${solutionPolicy.min}〜${solutionPolicy.max}個に収まりません`);
  }
  return errors;
}
