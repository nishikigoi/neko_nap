import { useEffect, useMemo, useState } from "react";
import catFaceIcon from "../assets/cat-face-icon.png";
import Board from "../components/Board";
import CompletionOverlay from "../components/CompletionOverlay";
import Controls from "../components/Controls";
import HomeScreen from "../components/HomeScreen";
import { allBeds, positionKey } from "../game/board";
import { conflictPairs } from "../game/lineOfSight";
import { canCompleteLevel, solveLevel } from "../game/solver";
import { catsFromMarks, createGameState, cycleBed, isComplete, undo } from "../game/state";
import type { GameState } from "../game/types";
import { levels } from "../levels/levels";
import { defaultSave, defaultSelectedLevel, emptyStats, loadSave, storeSave, type SaveData } from "../storage/progress";
import { useCopy } from "../i18n";

type Screen = "select" | "game";

export default function App() {
  const { copy } = useCopy();
  const [screen, setScreen] = useState<Screen>("select");
  const [levelIndex, setLevelIndex] = useState(0);
  const level = levels[levelIndex];
  const [game, setGame] = useState<GameState>(() => createGameState(levels[0]));
  const [save, setSave] = useState<SaveData>(() => {
    if (typeof localStorage === "undefined") return defaultSave();
    const loaded = loadSave();
    const nextAfterCompleted = Math.max(1, ...loaded.completedLevels.map((number) => number + 1));
    return { ...loaded, unlockedLevel: Math.min(levels.length, Math.max(loaded.unlockedLevel, nextAfterCompleted)) };
  });
  const [selectedLevel, setSelectedLevel] = useState(() =>
    defaultSelectedLevel(save.completedLevels, save.unlockedLevel, levels.length));
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

  const showLevelSelect = () => {
    setSelectedLevel(defaultSelectedLevel(save.completedLevels, save.unlockedLevel, levels.length));
    setScreen("select");
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
    const currentCats = catsFromMarks(level, game.marks);
    const currentCanComplete = canCompleteLevel(level, currentCats);
    const wrongCat = currentCanComplete
      ? undefined
      : currentCats.find((cat) => canCompleteLevel(level, currentCats.filter((other) => positionKey(other) !== positionKey(cat))));
    const continuation = solveLevel(
      level,
      1,
      wrongCat ? currentCats.filter((cat) => positionKey(cat) !== positionKey(wrongCat)) : currentCats,
    ).firstSolution ?? [];
    const missingCat = continuation.find((bed) => game.marks[positionKey(bed)] !== "cat");
    const target = wrongCat ?? missingCat;
    if (!target) return;
    const key = positionKey(target);
    setHintKey(key);
    setMessage(wrongCat
      ? copy.wrongBedHint
      : level.solutionPolicy
        ? copy.flexibleHint
        : copy.nextBedHint);
    setGame((current) => ({ ...current, hintCount: current.hintCount + 1 }));
  };

  const handleReset = () => {
    if (game.moveCount > 2 && !window.confirm(copy.resetConfirm)) return;
    setGame(createGameState(level));
    setHintKey(undefined);
    setMessage(undefined);
    setSave((current) => {
      const stats = current.stats[level.id] ?? emptyStats();
      return { ...current, stats: { ...current.stats, [level.id]: { ...stats, resets: stats.resets + 1 } } };
    });
  };

  if (screen === "select") {
    return (
      <HomeScreen
        selectedLevel={selectedLevel}
        unlockedLevel={save.unlockedLevel}
        completedLevels={save.completedLevels}
        levelCount={levels.length}
        onSelectLevel={setSelectedLevel}
        onStart={() => beginLevel(selectedLevel - 1)}
        copy={copy}
      />
    );
  }

  return (
    <main className="game-screen">
      <header className="game-header">
        <button className="icon-button" aria-label={copy.backToLevels} title={copy.backToLevels} onClick={showLevelSelect}>‹</button>
        <span className="stage-number">{copy.level} {level.number}</span>
        <span className="cat-counter" aria-label={copy.catsSleeping(level.catCount)}><img className="cat-counter__icon" src={catFaceIcon} alt="" /> <b>{catsFromMarks(level, game.marks).length}</b> / {level.catCount}</span>
      </header>
      <section className="play-area">
        <Board level={level} marks={game.marks} complete={complete} hintKey={hintKey} onBedClick={handleBedClick} copy={copy} />
        <div className={`status-message ${conflicts.length ? "status-message--warning" : ""}`} aria-live="polite">
          {message ?? (conflicts.length ? copy.conflict : " ")}
        </div>
        <Controls copy={copy} canUndo={game.history.length > 0} onUndo={() => setGame(undo(game))} onReset={handleReset} onHint={handleHint} />
      </section>
      {complete && game.completedAt && (
        <CompletionOverlay copy={copy} isLast={levelIndex === levels.length - 1} onNext={() => beginLevel(levelIndex + 1)} onSelect={showLevelSelect} />
      )}
    </main>
  );
}
