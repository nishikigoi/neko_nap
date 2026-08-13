import { allBeds } from "./board";
import { conflicts } from "./lineOfSight";
import type { Level, Position, SolveResult } from "./types";

export function enumerateSolutions(level: Level, limit = 2, requiredCats: Position[] = []): Position[][] {
  const beds = allBeds(level);
  const initial = [...(level.initialCats ?? []), ...requiredCats];
  const initialKeys = new Set(initial.map((cat) => `${cat.row},${cat.col}`));
  if (initialKeys.size !== initial.length || initial.some((cat) => !beds.some((bed) => bed.row === cat.row && bed.col === cat.col))) {
    return [];
  }
  const selectable = beds.filter(
    (bed) => !initial.some((cat) => cat.row === bed.row && cat.col === bed.col),
  );
  const solutions: Position[][] = [];

  function search(index: number, chosen: Position[]) {
    if (solutions.length >= limit) return;
    const allChosen = [...initial, ...chosen];
    if (allChosen.length === level.catCount) {
      solutions.push(allChosen);
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
    return [];
  }
  search(0, []);
  return solutions;
}

export function solveLevel(level: Level, limit = 2, requiredCats: Position[] = []): SolveResult {
  const solutions = enumerateSolutions(level, limit, requiredCats);
  return { solutionCount: solutions.length, firstSolution: solutions[0] };
}

export function canCompleteLevel(level: Level, requiredCats: Position[]) {
  return solveLevel(level, 1, requiredCats).solutionCount === 1;
}
