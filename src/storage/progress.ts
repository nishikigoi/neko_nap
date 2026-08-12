export const SAVE_KEY = "neko-nap-progress";
export const SAVE_VERSION = 1;

export interface StageStats {
  attempts: number;
  completions: number;
  bestTimeMs?: number;
  lastTimeMs?: number;
  moves: number;
  crosses: number;
  undos: number;
  resets: number;
  hints: number;
  conflicts: number;
}

export interface SaveData {
  version: number;
  unlockedLevel: number;
  completedLevels: number[];
  stats: Record<string, StageStats>;
}

export const emptyStats = (): StageStats => ({
  attempts: 0,
  completions: 0,
  moves: 0,
  crosses: 0,
  undos: 0,
  resets: 0,
  hints: 0,
  conflicts: 0,
});

export const defaultSave = (): SaveData => ({
  version: SAVE_VERSION,
  unlockedLevel: 1,
  completedLevels: [],
  stats: {},
});

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return defaultSave();
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    if (parsed.version !== SAVE_VERSION || !Array.isArray(parsed.completedLevels)) return defaultSave();
    return {
      version: SAVE_VERSION,
      unlockedLevel: Math.max(1, Number(parsed.unlockedLevel) || 1),
      completedLevels: parsed.completedLevels.filter(Number.isInteger),
      stats: parsed.stats && typeof parsed.stats === "object" ? parsed.stats : {},
    };
  } catch {
    return defaultSave();
  }
}

export function storeSave(save: SaveData) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(save));
}

export function exportSave(save: SaveData) {
  const blob = new Blob([JSON.stringify(save, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `neko-nap-playtest-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
