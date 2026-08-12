import { allBeds } from "./board";
import { conflicts } from "./lineOfSight";
import type { Level, Position, SolveResult } from "./types";

export function solveLevel(level: Level, limit = 2): SolveResult {
  const beds = allBeds(level);
  const initial = level.initialCats ?? [];
  const selectable = beds.filter(
    (bed) => !initial.some((cat) => cat.row === bed.row && cat.col === bed.col),
  );
  let count = 0;
  let firstSolution: Position[] | undefined;

  function search(index: number, chosen: Position[]) {
    if (count >= limit) return;
    const allChosen = [...initial, ...chosen];
    if (allChosen.length === level.catCount) {
      count += 1;
      firstSolution ??= allChosen;
      return;
    }
    if (index >= selectable.length) return;
    if (allChosen.length + selectable.length - index < level.catCount) return;

    const candidate = selectable[index];
    if (!allChosen.some((other) => conflicts(level, candidate, other))) {
      search(index + 1, [...chosen, candidate]);
    }
    search(index + 1, chosen);
  }

  if (initial.some((cat, index) => initial.slice(index + 1).some((b) => conflicts(level, cat, b)))) {
    return { solutionCount: 0 };
  }
  search(0, []);
  return { solutionCount: count, firstSolution };
}
