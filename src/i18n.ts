import { useEffect, useState } from "react";

export type Language = "en" | "ja";

const translations = {
  en: {
    tagline: "Find a cozy bed for every cat.",
    rulesHeading: "How to play",
    ruleSight: "Cats cannot sleep while facing each other in a row or column.",
    ruleFurniture: "Trees block their view.",
    levelsHeading: "Levels",
    start: "Start",
    level: "Level",
    completed: "Completed",
    available: "Available",
    locked: "Locked",
    exportData: "Export playtest data",
    backToLevels: "Back to levels",
    catsSleeping: (total: number) => `${total} cats to put to sleep`,
    board: (level: number) => `Level ${level} board`,
    bed: {
      cat: "bed with a cat",
      cross: "bed marked as unused",
      empty: "empty bed",
    },
    cellAt: (row: number, column: number, label: string) => `Row ${row}, column ${column}, ${label}`,
    furniture: "tree that blocks horizontal and vertical sight",
    floor: "floor",
    controls: "Game controls",
    undo: "Undo",
    reset: "Reset",
    hint: "Hint",
    conflict: "They can still see each other…",
    wrongBedHint: "Choosing this bed leaves no way to put every cat to sleep.",
    flexibleHint: "There is more than one solution. You can continue from this bed.",
    nextBedHint: "Try starting with this bed.",
    resetConfirm: "Start this level over?",
    complete: "Sweet dreams!",
    nextLevel: "Next level",
  },
  ja: {
    tagline: "みんなが安心できる寝床を見つけよう。",
    rulesHeading: "あそびかた",
    ruleSight: "猫同士は、上下左右に見つめ合うと眠れません。",
    ruleFurniture: "木が間にあれば、安心して眠れます。",
    levelsHeading: "ステージ",
    start: "スタート",
    level: "ステージ",
    completed: "クリア済み",
    available: "挑戦可能",
    locked: "未解放",
    exportData: "プレイテストデータを書き出す",
    backToLevels: "ステージ選択へ戻る",
    catsSleeping: (total: number) => `${total}匹寝かせる`,
    board: (level: number) => `ステージ${level}の盤面`,
    bed: {
      cat: "猫がいる寝床",
      cross: "置かない印を付けた寝床",
      empty: "空の寝床",
    },
    cellAt: (row: number, column: number, label: string) => `${row}行${column}列、${label}`,
    furniture: "縦横の視線を遮る木",
    floor: "床",
    controls: "ゲーム操作",
    undo: "一手戻す",
    reset: "リセット",
    hint: "ヒント",
    conflict: "まだ見つめ合っているみたい…",
    wrongBedHint: "この寝床を選ぶと、全員を寝かせられません。",
    flexibleHint: "眠り方はひとつではありません。この寝床から続けられます。",
    nextBedHint: "この寝床から考えてみよう。",
    resetConfirm: "このステージを最初からやり直しますか？",
    complete: "みんな、すやすや",
    nextLevel: "次のステージ",
  },
} as const;

export type Copy = (typeof translations)[Language];

export function languageFromBrowser(language?: string): Language {
  return language?.toLowerCase().startsWith("ja") ? "ja" : "en";
}

function browserLanguage(): Language {
  return languageFromBrowser(typeof navigator === "undefined" ? undefined : navigator.language);
}

export function useCopy() {
  const [language] = useState<Language>(browserLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return { language, copy: translations[language] };
}
