import { useEffect, useMemo, useState } from "react";
import Board from "../components/Board";
import CompletionOverlay from "../components/CompletionOverlay";
import Controls from "../components/Controls";
import LevelSelect from "../components/LevelSelect";
import { allBeds, positionKey } from "../game/board";
import { conflictPairs } from "../game/lineOfSight";
import { solveLevel } from "../game/solver";
import { catsFromMarks, createGameState, cycleBed, isComplete, undo } from "../game/state";
import type { GameState } from "../game/types";
import { levels } from "../levels/levels";
import { defaultSave, emptyStats, exportSave, loadSave, storeSave, type SaveData } from "../storage/progress";

type Screen = "select" | "game";

export default function App() {
  const [screen, setScreen] = useState<Screen>("select");
  const [levelIndex, setLevelIndex] = useState(0);
  const level = levels[levelIndex];
  const [game, setGame] = useState<GameState>(() => createGameState(levels[0]));
  const [save, setSave] = useState<SaveData>(() => typeof localStorage === "undefined" ? defaultSave() : loadSave());
  const [hintKey, setHintKey] = useState<string>();
  const [message, setMessage] = useState<string>();
  const complete = useMemo(() => isComplete(level, game.marks), [level, game.marks]);
  const conflicts = useMemo(() => conflictPairs(level, catsFromMarks(level, game.marks)), [level, game.marks]);

  useEffect(() => storeSave(save), [save]);

  useEffect(() => {
    if (!complete || game.completedAt) return;
    const finishedAt = Date.now();
    setGame((current) => ({ ...current, completedAt: finishedAt }));
    setSave((current) => {
      const stats = current.stats[level.id] ?? emptyStats();
      const elapsed = finishedAt - game.startedAt;
      return {
        ...current,
        unlockedLevel: Math.min(levels.length, Math.max(current.unlockedLevel, level.number + 1)),
        completedLevels: Array.from(new Set([...current.completedLevels, level.number])),
        stats: {
          ...current.stats,
          [level.id]: {
            ...stats,
            completions: stats.completions + 1,
            bestTimeMs: Math.min(stats.bestTimeMs ?? elapsed, elapsed),
            lastTimeMs: elapsed,
            moves: stats.moves + game.moveCount,
            undos: stats.undos + game.undoCount,
            hints: stats.hints + game.hintCount,
          },
        },
      };
    });
  }, [complete, game, level]);

  const beginLevel = (index: number) => {
    const next = levels[index];
    setLevelIndex(index);
    setGame(createGameState(next));
    setHintKey(undefined);
    setMessage(undefined);
    setScreen("game");
    setSave((current) => {
      const stats = current.stats[next.id] ?? emptyStats();
      return { ...current, stats: { ...current.stats, [next.id]: { ...stats, attempts: stats.attempts + 1 } } };
    });
  };

  const handleBedClick = (key: string) => {
    if (complete) return;
    const previous = game.marks[key];
    const next = cycleBed(game, key);
    setGame(next);
    setHintKey(undefined);
    setMessage(undefined);
    if (previous === "empty") {
      const nextPairs = conflictPairs(level, catsFromMarks(level, next.marks));
      if (nextPairs.length > conflicts.length) {
        setSave((current) => {
          const stats = current.stats[level.id] ?? emptyStats();
          return { ...current, stats: { ...current.stats, [level.id]: { ...stats, conflicts: stats.conflicts + 1 } } };
        });
      }
    } else if (previous === "cat") {
      setSave((current) => {
        const stats = current.stats[level.id] ?? emptyStats();
        return { ...current, stats: { ...current.stats, [level.id]: { ...stats, crosses: stats.crosses + 1 } } };
      });
    }
  };

  const handleHint = () => {
    const solution = solveLevel(level, 1).firstSolution ?? [];
    const solutionKeys = new Set(solution.map(positionKey));
    const wrongCat = allBeds(level).find((bed) => game.marks[positionKey(bed)] === "cat" && !solutionKeys.has(positionKey(bed)));
    const missingCat = solution.find((bed) => game.marks[positionKey(bed)] !== "cat");
    const target = wrongCat ?? missingCat;
    if (!target) return;
    const key = positionKey(target);
    setHintKey(key);
    setMessage(wrongCat ? "この寝床を選ぶと、残りの猫を全員寝かせられません。" : "この寝床から考えると、みんなの場所が見つかりそうです。");
    setGame((current) => ({ ...current, hintCount: current.hintCount + 1 }));
  };

  const handleReset = () => {
    if (game.moveCount > 2 && !window.confirm("このステージを最初からやり直しますか？")) return;
    setGame(createGameState(level));
    setHintKey(undefined);
    setMessage(undefined);
    setSave((current) => {
      const stats = current.stats[level.id] ?? emptyStats();
      return { ...current, stats: { ...current.stats, [level.id]: { ...stats, resets: stats.resets + 1 } } };
    });
  };

  if (screen === "select") {
    return <LevelSelect levels={levels} save={save} onSelect={beginLevel} onExport={() => exportSave(save)} />;
  }

  return (
    <main className="game-screen">
      <header className="game-header">
        <button className="icon-button" aria-label="ステージ選択へ戻る" onClick={() => setScreen("select")}>‹</button>
        <div>
          <span className="stage-label">STAGE {level.number}</span>
          <h1>{level.title}</h1>
        </div>
        <span className="cat-counter" aria-label={`${level.catCount}匹寝かせる`}><b>{catsFromMarks(level, game.marks).length}</b> / {level.catCount}</span>
      </header>
      <section className="play-area">
        <p className="instruction">{level.instruction}</p>
        <Board level={level} marks={game.marks} complete={complete} hintKey={hintKey} onBedClick={handleBedClick} />
        <div className={`status-message ${conflicts.length ? "status-message--warning" : ""}`} aria-live="polite">
          {message ?? (conflicts.length ? "視線が合って、まだ眠れないみたい…" : "　")}
        </div>
        <Controls canUndo={game.history.length > 0} onUndo={() => setGame(undo(game))} onReset={handleReset} onHint={handleHint} />
      </section>
      {complete && game.completedAt && (
        <CompletionOverlay isLast={levelIndex === levels.length - 1} onNext={() => beginLevel(levelIndex + 1)} onSelect={() => setScreen("select")} />
      )}
    </main>
  );
}
