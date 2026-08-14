import { evaluateDifficulty } from "../src/game/difficulty";
import { levels } from "../src/levels/levels";

const results = levels.map(evaluateDifficulty);

console.table(results.map((result) => ({
  level: result.levelId,
  beds: result.bedCount,
  cats: result.catCount,
  furniture: result.furnitureCount,
  solutionColumnProfiles: result.solutionColumnProfileCount,
  solutionRowProfiles: result.solutionRowProfileCount,
  columnSlack: result.axisCapacity.columnCapacitySlack,
  columnAllocations: result.axisCapacity.columnAllocationCount,
  rowSlack: result.axisCapacity.rowCapacitySlack,
  rowAllocations: result.axisCapacity.rowAllocationCount,
  columnProfiles: result.oneMoveBefore.columnProfileCount,
  rowProfiles: result.oneMoveBefore.rowProfileCount,
  sameProfile: result.oneMoveBefore.maxPlacementsPerJointProfile,
  lateWrongBeds: `${result.wrongBeds.lateContradictionCount}/${result.wrongBeds.wrongBedCount}`,
  deadEnds: `${result.uniqueSolution.oneMoveBeforeDeadEndCount}/${result.uniqueSolution.twoMovesBeforeDeadEndCount}`,
  peeling: result.uniqueSolution.peelingRoundSizes.join("→"),
  ambiguity: result.scoreBreakdown.ambiguity.toFixed(2),
  uniqueDeadEnds: result.scoreBreakdown.uniqueDeadEnds.toFixed(2),
  deductionChain: result.scoreBreakdown.deductionChain.toFixed(2),
  score: result.difficultyScore.toFixed(2),
  warnings: result.warnings.join(" / "),
})));

const warned = results.filter((result) => result.warnings.length > 0);
console.log(`\n${results.length}ステージ中、${warned.length}ステージに警告があります。`);

if (warned.length > 0) {
  console.log("警告は既存盤面を差し替えるための評価結果であり、コマンド失敗にはしていません。");
}
