import type { CellKind, Level } from "../game/types";

const map = (rows: string[]): CellKind[] =>
  rows.join("").split("").map((char): CellKind => {
    if (char === "B") return "bed";
    if (char === "F") return "furniture";
    return "floor";
  });

export const levels: Level[] = [
  {
    id: "level-01",
    number: 1,
    width: 2,
    height: 2,
    catCount: 1,
    title: "はじめてのお昼寝",
    instruction: "光っている寝床をタップして、猫を寝かせよう",
    cells: map(["F.", ".B"]),
  },
  {
    id: "level-02",
    number: 2,
    width: 3,
    height: 2,
    catCount: 2,
    title: "視線が気になる",
    instruction: "猫同士は、上下左右に見つめ合うと眠れません",
    cells: map(["B.B", "B.."]),
  },
  {
    id: "level-03",
    number: 3,
    width: 3,
    height: 2,
    catCount: 2,
    title: "ちいさな目隠し",
    instruction: "家具が間にあれば、安心して眠れます",
    cells: map(["BFB", "..."]),
  },
  {
    id: "level-04",
    number: 4,
    width: 3,
    height: 3,
    catCount: 3,
    title: "みんなの寝床",
    instruction: "ここに置いたあと、残りの猫も寝かせられるかな？",
    cells: map(["B.B", ".FB", "BB."]),
  },
];
