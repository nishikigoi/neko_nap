import { allBeds, positionKey } from "../game/board";
import { conflictPairs, conflicts } from "../game/lineOfSight";
import { catsFromMarks } from "../game/state";
import type { Level, Marks, Position } from "../game/types";
import Cat from "./Cat";

interface BoardProps {
  level: Level;
  marks: Marks;
  complete: boolean;
  hintKey?: string;
  onBedClick: (key: string) => void;
}

const inConflictLine = (position: Position, a: Position, b: Position) => {
  if (a.row === b.row && position.row === a.row) {
    return position.col >= Math.min(a.col, b.col) && position.col <= Math.max(a.col, b.col);
  }
  if (a.col === b.col && position.col === a.col) {
    return position.row >= Math.min(a.row, b.row) && position.row <= Math.max(a.row, b.row);
  }
  return false;
};

export default function Board({ level, marks, complete, hintKey, onBedClick }: BoardProps) {
  const cats = catsFromMarks(level, marks);
  const pairs = conflictPairs(level, cats);
  const conflictKeys = new Set(pairs.flat().map(positionKey));
  const beds = new Set(allBeds(level).map(positionKey));

  return (
    <div className="board-scroll">
      <div
        className="board"
        style={{ "--board-cols": level.width, "--board-rows": level.height } as React.CSSProperties}
        role="grid"
        aria-label={`ステージ${level.number}の盤面`}
      >
      {level.cells.map((kind, index) => {
        const position = { row: Math.floor(index / level.width), col: index % level.width };
        const key = positionKey(position);
        const mark = marks[key];
        const isConflict = conflictKeys.has(key);
        const onConflictLine = pairs.some(([a, b]) => inConflictLine(position, a, b));
        const unavailable = kind === "bed" && mark !== "cat" && cats.some((cat) => conflicts(level, position, cat));
        const classes = [
          "cell",
          `cell--${kind}`,
          onConflictLine ? "cell--conflict-line" : "",
          unavailable ? "cell--unavailable" : "",
          hintKey === key ? "cell--hint" : "",
        ].filter(Boolean).join(" ");

        if (beds.has(key)) {
          const label = mark === "cat" ? "猫がいる寝床" : mark === "cross" ? "置かない印を付けた寝床" : "空の寝床";
          return (
            <button
              className={classes}
              key={key}
              role="gridcell"
              aria-label={`${position.row + 1}行${position.col + 1}列、${label}`}
              onClick={() => onBedClick(key)}
            >
              <span className="bed" aria-hidden="true"><span className="bed__pillow" /></span>
              {mark === "cat" && <Cat sleeping={complete} conflict={isConflict} />}
              {mark === "cross" && <span className="cross" aria-hidden="true">×</span>}
            </button>
          );
        }

        const barrierLabel = kind === "vertical-barrier"
          ? "縦方向に視線を通す土管"
          : kind === "horizontal-barrier"
            ? "横方向に視線を通す土管"
            : kind === "furniture" ? "縦横の視線を遮る家具" : "床";
        return (
          <div className={classes} key={key} role="gridcell" aria-label={barrierLabel}>
            {kind === "furniture" && (
              <span className="plant" aria-hidden="true"><span className="plant__leaf plant__leaf--1" /><span className="plant__leaf plant__leaf--2" /><span className="plant__leaf plant__leaf--3" /><span className="plant__pot" /></span>
            )}
            {kind === "vertical-barrier" && <span className="pipe pipe--vertical" aria-hidden="true" />}
            {kind === "horizontal-barrier" && <span className="pipe pipe--horizontal" aria-hidden="true" />}
          </div>
        );
        })}
      </div>
    </div>
  );
}
