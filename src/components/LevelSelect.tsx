import type { Level } from "../game/types";
import type { SaveData } from "../storage/progress";

interface LevelSelectProps {
  levels: Level[];
  save: SaveData;
  onSelect: (index: number) => void;
  onExport: () => void;
}

export default function LevelSelect({ levels, save, onSelect, onExport }: LevelSelectProps) {
  return (
    <main className="select-screen">
      <div className="brand brand--large"><span>Neko</span> Nap <span className="brand__moon">☾</span></div>
      <p className="select-screen__lead">みんなが安心できる寝床を<br />見つけてあげよう。</p>
      <section className="level-list" aria-labelledby="level-heading">
        <h1 id="level-heading">お昼寝する部屋</h1>
        <div className="level-grid">
          {levels.map((level, index) => {
            const unlocked = level.number <= save.unlockedLevel;
            const complete = save.completedLevels.includes(level.number);
            return (
              <button className={`level-card ${complete ? "level-card--complete" : ""}`} disabled={!unlocked} key={level.id} onClick={() => onSelect(index)}>
                <span className="level-card__number">{level.number}</span>
                <span className="level-card__copy">
                  <span className="level-card__name">{level.title}</span>
                  <span className="level-card__difficulty">{level.difficulty}{level.pacing === "peak" ? " · 山場" : level.pacing === "breather" ? " · ひとやすみ" : ""}</span>
                </span>
                <span className="level-card__state" aria-label={complete ? "クリア済み" : unlocked ? "挑戦可能" : "未解放"}>{complete ? "✓" : unlocked ? "○" : "🔒"}</span>
              </button>
            );
          })}
        </div>
      </section>
      <button className="text-button" onClick={onExport}>プレイテストデータを書き出す</button>
    </main>
  );
}
