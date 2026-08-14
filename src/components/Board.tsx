import { allBeds, positionKey } from "../game/board";
import { conflictPairs, conflicts } from "../game/lineOfSight";
import { catsFromMarks } from "../game/state";
import type { Level, Marks, Position } from "../game/types";
import Cat from "./Cat";
import type { Copy } from "../i18n";
import bedCushionIcon from "../assets/bed-cushion-icon.png";
import treeObstacleIcon from "../assets/tree-obstacle-icon.png";

interface BoardProps {
  level: Level;
  marks: Marks;
  complete: boolean;
  hintKey?: string;
  onBedClick: (key: string) => void;
  copy: Copy;
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

export default function Board({ level, marks, complete, hintKey, onBedClick, copy }: BoardProps) {
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
        aria-label={copy.board(level.number)}
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
          const label = copy.bed[mark];
          return (
            <button
              className={classes}
              key={key}
              role="gridcell"
              aria-label={copy.cellAt(position.row + 1, position.col + 1, label)}
              onClick={() => onBedClick(key)}
            >
              <img className="bed" src={bedCushionIcon} alt="" aria-hidden="true" />
              {mark === "cat" && <Cat sleeping={complete} conflict={isConflict} />}
              {mark === "cross" && <span className="cross" aria-hidden="true">×</span>}
            </button>
          );
        }

        const barrierLabel = kind === "furniture" ? copy.furniture : copy.floor;
        return (
          <div className={classes} key={key} role="gridcell" aria-label={barrierLabel}>
            {kind === "furniture" && (
              <img className="obstacle" src={treeObstacleIcon} alt="" aria-hidden="true" />
            )}
          </div>
        );
        })}
      </div>
    </div>
  );
}
