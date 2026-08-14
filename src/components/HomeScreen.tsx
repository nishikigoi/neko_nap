import { useEffect, useId, useRef, useState } from "react";
import type { Copy } from "../i18n";
import catFaceIcon from "../assets/cat-face-icon.png";
import sleepyKitten from "../assets/sleepy-kitten-resting.png";
import treeObstacleIcon from "../assets/tree-obstacle-icon.png";

interface HomeScreenProps {
  onStart: () => void;
  selectedLevel: number;
  unlockedLevel: number;
  completedLevels: number[];
  levelCount: number;
  onSelectLevel: (level: number) => void;
  copy: Copy;
}

export default function HomeScreen({
  onStart,
  selectedLevel,
  unlockedLevel,
  completedLevels,
  levelCount,
  onSelectLevel,
  copy,
}: HomeScreenProps) {
  const [isStagePickerOpen, setIsStagePickerOpen] = useState(false);
  const stagePickerId = useId();
  const stagePickerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const completed = new Set(completedLevels);
  const selectableLevelCount = Math.min(unlockedLevel, levelCount);

  useEffect(() => {
    if (!isStagePickerOpen) return;

    optionRefs.current[selectedLevel - 1]?.focus();
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!stagePickerRef.current?.contains(event.target as Node)) setIsStagePickerOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [isStagePickerOpen, selectedLevel]);

  const selectStage = (level: number) => {
    onSelectLevel(level);
    setIsStagePickerOpen(false);
    triggerRef.current?.focus();
  };

  const handleOptionKeyDown = (event: React.KeyboardEvent, level: number) => {
    let nextLevel: number | undefined;
    if (event.key === "ArrowDown") nextLevel = level === selectableLevelCount ? 1 : level + 1;
    if (event.key === "ArrowUp") nextLevel = level === 1 ? selectableLevelCount : level - 1;
    if (event.key === "Home") nextLevel = 1;
    if (event.key === "End") nextLevel = selectableLevelCount;
    if (event.key === "Escape") {
      event.preventDefault();
      setIsStagePickerOpen(false);
      triggerRef.current?.focus();
      return;
    }
    if (nextLevel !== undefined) {
      event.preventDefault();
      optionRefs.current[nextLevel - 1]?.focus();
    }
  };

  return (
    <main className="select-screen">
      <div className="brand brand--large"><span>Neko</span> Nap <span className="brand__moon">☾</span></div>
      <p className="select-screen__lead">{copy.tagline}</p>
      <div className="nap-journey" aria-hidden="true">
        <span className="nap-journey__cloud nap-journey__cloud--left" />
        <span className="nap-journey__cloud nap-journey__cloud--right" />
        <span className="nap-journey__spark nap-journey__spark--one">✦</span>
        <span className="nap-journey__spark nap-journey__spark--two">✧</span>
        <span className="nap-journey__hill nap-journey__hill--back" />
        <span className="nap-journey__hill nap-journey__hill--front" />
        <span className="nap-journey__cushion" />
        <span className="nap-journey__sleeper">
          <img className="nap-journey__kitten" src={sleepyKitten} alt="" />
          <img className="nap-journey__kitten nap-journey__kitten--rump" src={sleepyKitten} alt="" />
          <img className="nap-journey__kitten nap-journey__kitten--tail-tip" src={sleepyKitten} alt="" />
          <img className="nap-journey__kitten nap-journey__kitten--paw" src={sleepyKitten} alt="" />
          <span className="nap-journey__zzz nap-journey__zzz--one">z</span>
          <span className="nap-journey__zzz nap-journey__zzz--two">z</span>
          <span className="nap-journey__zzz nap-journey__zzz--three">z</span>
        </span>
      </div>
      <section className="rules" aria-labelledby="rules-heading">
        <h1 id="rules-heading">{copy.rulesHeading}</h1>
        <p><span className="rules__icons" aria-hidden="true"><img src={catFaceIcon} alt="" /><b className="rules__arrow">↔</b><img src={catFaceIcon} alt="" /></span>{copy.ruleSight}</p>
        <p><span className="rules__icons" aria-hidden="true"><img src={catFaceIcon} alt="" /><img src={treeObstacleIcon} alt="" /><img src={catFaceIcon} alt="" /></span>{copy.ruleFurniture}</p>
      </section>
      <div className="stage-picker" ref={stagePickerRef}>
        <button
          ref={triggerRef}
          type="button"
          className="stage-picker__trigger"
          aria-label={copy.levelsHeading}
          aria-haspopup="listbox"
          aria-expanded={isStagePickerOpen}
          aria-controls={stagePickerId}
          onClick={() => setIsStagePickerOpen((current) => !current)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              setIsStagePickerOpen(true);
            }
          }}
        >
          <span className="stage-picker__cat" aria-hidden="true"><img src={catFaceIcon} alt="" /></span>
          <span className="stage-picker__current">{copy.level} {selectedLevel}</span>
          {completed.has(selectedLevel) && <span className="stage-picker__check" aria-label={copy.completed}>✓</span>}
        </button>
        {isStagePickerOpen && (
          <div className="stage-picker__menu" id={stagePickerId} role="listbox" aria-label={copy.levelsHeading}>
            {Array.from({ length: selectableLevelCount }, (_, index) => index + 1).map((level) => {
              const isCompleted = completed.has(level);
              return (
                <button
                  ref={(element) => { optionRefs.current[level - 1] = element; }}
                  type="button"
                  className="stage-picker__option"
                  role="option"
                  aria-selected={selectedLevel === level}
                  onClick={() => selectStage(level)}
                  onKeyDown={(event) => handleOptionKeyDown(event, level)}
                  key={level}
                >
                  <span>{copy.level} {level}</span>
                  {isCompleted && <span className="stage-picker__check" aria-label={copy.completed}>✓</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
      <button className="start-button" aria-label={copy.start} title={copy.start} onClick={onStart}>▶</button>
    </main>
  );
}
