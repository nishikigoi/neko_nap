import type { CellKind, Level } from "../game/types";

const map = (rows: string[]): CellKind[] =>
  rows.join("").split("").map((char): CellKind => {
    if (char === "B") return "bed";
    if (char === "F") return "furniture";
    if (char === "V") return "vertical-barrier";
    if (char === "H") return "horizontal-barrier";
    return "floor";
  });

type Difficulty = Level["difficulty"];
type Pacing = NonNullable<Level["pacing"]>;

function defineLevel(
  number: number,
  catCount: number,
  difficulty: Difficulty,
  title: string,
  instruction: string,
  rows: string[],
  pacing: Pacing = "standard",
  solutionPolicy?: Level["solutionPolicy"],
): Level {
  return {
    id: `level-${String(number).padStart(2, "0")}`,
    number,
    width: rows[0].length,
    height: rows.length,
    catCount,
    difficulty,
    pacing,
    solutionPolicy,
    title,
    instruction,
    cells: map(rows),
  };
}

const legacyLevels: Level[] = [
  defineLevel(1, 1, "N0", "はじめてのお昼寝", "光っている寝床をタップして、猫を寝かせよう", ["F.", ".B"], "tutorial"),
  defineLevel(2, 2, "N0", "視線が気になる", "猫同士は、上下左右に見つめ合うと眠れません", ["B.B", "B.."], "tutorial"),
  defineLevel(3, 2, "N0", "ちいさな目隠し", "家具が間にあれば、安心して眠れます", ["BFB", "..."], "tutorial"),
  defineLevel(4, 3, "N1", "置かないしるし", "置けない寝床に×を付けて、候補をしぼろう", ["B.B", ".FB", "BB."], "tutorial"),
  defineLevel(5, 3, "N1", "ふたつの窓辺", "家具の向こう側なら、同じ列や行でも大丈夫", ["BFB", ".F.", "BBB"]),
  defineLevel(6, 3, "N2", "ついたての向こう", "同じ行に二匹寝られる場所を探そう", [".BFB", "BB.B", ".F.."]),
  defineLevel(7, 3, "N2", "すやすやリレー", "ひとつ決まると、次の寝床も見えてきます", [".F..", ".BFB", "BB.B", "...."]),
  defineLevel(8, 4, "N2", "ふたつの小部屋", "行と列ではなく、家具で分かれた区間を見よう", ["BBFB", ".FF.", "B..B", "BB.B"]),
  defineLevel(9, 4, "N3", "夜風の通り道", "ここに置いたあと、残りのみんなも眠れるかな？", ["B..B.", "BFFBB", "...F.", "B..BB"]),
  defineLevel(10, 4, "N3", "ふたつの眠り方", "列ごとの猫の数はひとつとは限りません", ["BBB.B", "BFBFF", "BBB.F", ".....", "..B.F"], "peak", { min: 4, max: 4 }),
  defineLevel(11, 4, "N2", "雨音のひとやすみ", "短い区間から、眠れる場所を見つけよう", [".BB.B", ".....", "..F.B", ".B..F", "..BF."], "breather"),
  defineLevel(12, 5, "N3", "クッションの小道", "ひとつの仮定から、足りなくなる場所を探そう", ["BB.BB", "B..BF", "....F", "BBFBF", "BB.BB"]),
  defineLevel(13, 4, "N3", "背の高い観葉植物", "猫の数は行や列の数と同じとは限りません", ["F....", "BF..B", "F....", "F..BB", "B..BB"]),
  defineLevel(14, 5, "N3", "離れたお気に入り", "遠くの寝床も、同じ視線区間につながっています", [".BF..B", ".FF.BB", "FBB.BB", "..B.BB", "....F."]),
  defineLevel(15, 6, "N4", "月影のついたて", "候補が消えていく順番を、二手先まで追おう", [".FF...", "B.BB.F", ".FB..B", "FB..FB", "BBBB..", ".BBB.B"]),
  defineLevel(16, 5, "N2", "午後のそよ風", "見つけやすい区間から、ゆっくり始めよう", ["...FB", ".FBBB", ".F...", ".BFB.", "..B.."], "breather"),
  defineLevel(17, 5, "N4", "葉っぱのカーテン", "横の確定が、縦の候補を変えていきます", ["F...BB", ".B.FBF", ".F.FBB", ".B..BB", "......"]),
  defineLevel(18, 5, "N4", "空いている列", "すべての列に猫が必要とは限りません", ["......", ".BB...", "BFBF.B", "BBB...", "..F.FF", ".F...."]),
  defineLevel(19, 7, "N4", "七匹の秘密基地", "家具を挟めば、同じ行に何匹か眠れます", [".F.FFB", "FF.B..", ".BFFBB", "...BB.", "B.B.BB", "BB.BBB"]),
  defineLevel(20, 5, "N4", "交差する土管", "土管の向きを見て、縦と横の視線を別々に追おう", ["H.FF..", "FB.BBB", ".BVB.B", ".BBBBB", "..VB..", "F..FF."], "peak", { min: 1, max: 1 }),
  defineLevel(21, 5, "N3", "毛布でひとやすみ", "まとまりごとに考えると、すぐに見えてきます", ["F.....", "..F..F", "....B.", ".BFBFB", ".B.BBB"], "breather"),
  defineLevel(22, 6, "N4", "まよえるクッション", "置けそうな候補を、ひとつずつ確かめよう", ["FF....", "B.FBF.", ".F...F", "..BBBB", "BBFB.B", "BB.BBB"]),
  defineLevel(23, 6, "N4", "でこぼこな部屋", "左右非対称な家具の区切りを読み解こう", ["..F..BF", "B...B.F", "BB..B.B", "BBFFB..", "..FFF..", "BB..BB."]),
  defineLevel(24, 7, "N5", "ふたつの仮定", "二つの候補を比べ、最後まで置ける方を選ぼう", ["F....F.", "FFFBBFB", "....B..", "F...FBB", "F..BB.B", ".B....B", "B..BBBB"]),
  defineLevel(25, 8, "N5", "真夜中のパーティー", "家具を挟む配置を組み合わせる、大きな山場です", [".FBF..F", ".FBBF..", "BBFBB..", "..B.B..", "B..B.F.", "F.F.BB.", "..BBBBF"], "peak"),
  defineLevel(26, 6, "N3", "あくびの時間", "短い視線区間から順番に決めよう", ["..F...", ".BB.BB", ".BFFB.", "..B.FB", "....B.", "F....F"], "breather"),
  defineLevel(27, 7, "N5", "遠くの寝息", "ひとつの選択が、離れた区間まで届きます", ["FBB.FBF", "FB..FBB", "...B.BB", "..F....", "F.FBBBF", "..BBBB."]),
  defineLevel(28, 6, "N5", "余白の多い部屋", "猫が少ないぶん、まぎらわしい候補に注意しよう", ["...B...", "..FB.B.", "B..FB..", "...BB.F", "BB.BBB.", "FFFF.F.", "....F.F"]),
  defineLevel(29, 8, "N5", "三つ先の寝床", "候補が消える連鎖を、三段階追ってみよう", ["FF...F..", "BBF...BB", "B.BF.F.F", "FBB..B..", "B..FFB.B", "B.B...BB", "..B..F.."]),
  defineLevel(30, 8, "N5", "夢見る回廊", "ここまで覚えた区間推理をすべて使おう", ["......FB", ".....B.B", "BFFB..B.", "F..FF.BB", "..F....F", "F..BBBBF", "B..F....", "B...BBBF"], "peak"),
  defineLevel(31, 6, "N4", "小部屋めぐり", "盤面をいくつかの小部屋に分けて考えよう", ["BB.F..", "F....F", "B..FBB", ".B....", "F....B", "..F..F", ".....B"], "breather"),
  defineLevel(32, 7, "N5", "足りない寝床", "二つの区間で起きる定員不足を比べよう", ["FF.BFB.", "FB.B.B.", ".F...FF", "....BF.", "BB.B.BF", "BB..BF.", "B..BB.."]),
  defineLevel(33, 7, "N5", "七匹未満", "行や列の数を手掛かりにせず、区間だけを見よう", ["..F..BB.", "F.....BF", "..F..F..", "BBFFFB.F", "B.....FF", "BB.B.B.B", "BB.B.B.."]),
  defineLevel(34, 9, "N5", "にぎやかな静けさ", "同じ行に眠る猫たちを、家具でそっと分けよう", ["......F.", ".B.FF...", "BFFF....", "FB.F..B.", "..FFFB.B", "FB.BF.BB", "BB..BBB.", "B..B..B."]),
  defineLevel(35, 8, "N6", "深い夢の入口", "ひとつの仮定から始まる長い連鎖を見つけよう", ["..FFBB.F", "FFF..B..", "...B.FB.", "F...FF.B", "F...BB.B", "F...B.BB", "..BBB.B.", ".F.....F"], "peak"),
  defineLevel(36, 7, "N4", "まどろみの午後", "確かな寝床から、素直に候補を広げよう", ["..B..FB", "B..B..B", "B..F...", "F.F....", ".FFF...", "..B....", "BF..BF."], "breather"),
  defineLevel(37, 8, "N5", "三枚のカーテン", "三つの区間が互いにどう影響するか追おう", [".F....F.", "..B.FBFF", "BBB.F.BF", "F.BBF.F.", "F...FB.B", "......BB", ".BBB.B.B"]),
  defineLevel(38, 7, "N6", "静かな空き部屋", "候補が多くても、必要な猫は七匹だけです", ["...FFFF.", "BBF.FFB.", "..F.F..F", ".......F", ".BF.B..B", "B..BB...", "BB..B.B.", ".FBB...F"]),
  defineLevel(39, 9, "N6", "二重の見通し", "二段階の仮定から、置けない区間を見抜こう", ["..F..B.F.", "F.FB..F..", "FBFFB.F..", "....F.BFF", "F.FBBF...", ".BBB..B..", ".B.BBBB..", ".B.B....."]),
  defineLevel(40, 9, "N6", "夜更けの大広間", "離れた区間まで続く推理を、最後までつなごう", ["B....F.FF", "...F.....", "..FFBBBBF", "FB...B...", "..B..F.B.", "F.F....F.", "BBF.B..F.", "..F...BF.", "BB..B.BB."], "peak"),
  defineLevel(41, 7, "N4", "星を数えて", "長い部屋も、近くの区間から解けば大丈夫", ["...B.BF", "F.....F", ".BB.F..", ".F.F..F", ".......", "BF.BFB.", "..B...B", ".F....B"], "breather"),
  defineLevel(42, 8, "N5", "同じ答えへの道", "別々の手掛かりが、同じ寝床を指しています", ["FFFF.B.F", "...FB.FB", "B.....BB", "B.B..B..", ".FFBB..B", "..BBFBBB", "..F.....", ".F.F..F."]),
  defineLevel(43, 8, "N6", "足りなくなる未来", "その寝床を選んだ未来を、深く追ってみよう", ["..F....FB", "...BFFF.F", "BBF.B..FF", "B.BBB.F..", "B...F.B..", "BBBB....B", "..FF..F.F", ".F......."]),
  defineLevel(44, 10, "N6", "十匹の寝息", "家具の両側に眠る猫たちを、全体で釣り合わせよう", [".BFF..FBF", "F.F......", ".F.FBB...", "BBBF.BF..", "FB.F..F.F", "B.....B..", "..B......", "FB...BBB.", "B...BBFF."]),
  defineLevel(45, 9, "N6", "夢の連鎖", "二本の長い推理をつなぐ、最後の大きな山場です", ["..BFFBF.B", "FFF.F.BB.", "....BBFBB", "...F..BBF", "F..BBBBB.", "..F......", ".......FF", ".........", "FF...FBBF"], "peak"),
  defineLevel(46, 8, "N5", "おやすみ前の深呼吸", "最終区間の前に、明快な連鎖を楽しもう", ["......F.", ".BB..BFB", "..B.....", ".B..F.F.", ".FFF.BBB", "FB....FF", ".F.F.BBF", "..B..B.."], "breather"),
  defineLevel(47, 10, "N6", "めぐる視線", "三つの区間が輪のようにつながっています", [".....B..F", ".F...FB..", "..FFFFF..", ".F...F...", "BB.F.BB..", "B....BBFB", "..BF.BFF.", "BB.BBB...", ".B..BFF.F"]),
  defineLevel(48, 8, "N6", "少ない寝息", "広い部屋に八匹。余分な候補を見極めよう", ["F..B...BF", "...F....F", "BBF.B..BF", "...F..F..", ".F.BB..B.", "B.F.BB...", ".B..B..F.", ".FF.B...F", "FF..F.FF."]),
  defineLevel(49, 10, "N6", "夜明け前の試験", "これまでの推理をすべて使って、十匹を寝かせよう", [".FBFB....F", ".F.F...F..", "FB..FB..BF", "F.B.B....B", ".F.......F", "FB....BF.F", "...BB...F.", ".BFB.BBF..", "F...B.B..F"]),
  defineLevel(50, 11, "N6", "Perfect Nap", "猫たちに最高のお昼寝をプレゼントしよう", ["FF.....F.F", "F..F.BF..F", ".BB..FBB..", "F.B.F.BF..", "....BB.B..", "BF..BBB.B.", "....FB.BF.", ".FBBF.F...", "...F.F.B.F", "..F.F....."], "finale"),
];

type Replacement = readonly [number, number, number, string];

const replacements: Replacement[] = [
  [11, 5, 8, "FFB.F./BBB.BB/B.BFB./BBBBBB/.FBF.F/F..F.F"],
  [12, 5, 12, ".F...F/BFBB.F/B.BBBB/B.BBBB/.FB.F./BF.B.F"],
  [13, 5, 12, "FBB.BB/FFB.BB/.F..BB/.FFFBB/.BB.BB/..FFBB"],
  [14, 6, 6, ".BBBB.F/F..BFFF/..BBF.F/B.BBF../BBBB.../.BBBBFF/B..BF.F"],
  [15, 5, 8, ".FB..F/F.BBBB/F.BB.F/.BBBB./.FB..F/FBBBBF"],
  [16, 5, 8, ".BBBBF/.BBBB./F.FBBF/FBBB.B/.FF.B./.F..B."],
  [17, 5, 10, "F..BFB/F.FB.B/B.BB.B/.FBBBB/BFFB.B/FFFBFF"],
  [18, 5, 12, "BB.BBB/FFF.B./F.FB.B/F.F.BB/BB.BBB/FFF.FB"],
  [19, 5, 12, ".FBB.F/FF.B../FBBBB./.BBBBF/FFFBFF/.BBB.B"],
  [21, 5, 12, "BFF..B/BBB.BB/BBBB.B/F...BB/F.FFFB/..FF.B"],
  [22, 5, 12, "..B..F/BBB.BF/BBB.BB/BFBFBF/BFBFB./F.F.F."],
  [23, 5, 12, "BF.B.B/B.F.FB/BBBBBB/BB.BBF/BFF.FF/..F..."],
  [24, 5, 12, ".F.BBF/BB.BB./BFFBB./BBBBBB/B..F.F/.F..F."],
  [25, 5, 8, "BBBB.B/BBBF../.BBBBF/FBB..F/.B.F.F/FBFFFF"],
  [26, 5, 12, "BBBBBB/...BBB/...BBF/FBFBB./FF..B./.FF.BF"],
  [27, 6, 12, "FBF.FFF/BBB.B../FBBB..B/.B....B/..BB..B/BBBBBF./FBFFFFF"],
  [28, 5, 12, "F...F./BB.BBF/BFFBBF/.F.BB./BBBBBB/FFFBFF"],
  [29, 5, 12, "B.FFFF/BBB.BB/BBB..B/B....F/BFB..B/B.B.FF"],
  [30, 5, 8, ".BF.F./FBBBBB/FB.BBF/F.F.BF/.BF.BF/.BBBB."],
  [31, 5, 12, "FBBBBB/BF.BB./B.BBBF/BFFBBF/BF.F.F/...F.F"],
  [32, 5, 12, "B.BB../.FB.F./B.BB../BBBBBB/FFBFFB/.FB..F"],
  [33, 5, 12, "FFFF../BBB.BB/BB.BFF/BBFB../BBBB../.FFBFF"],
  [34, 5, 10, "BBBB.F/BFBB../BF..../BBBB.B/B.B.F./FFBFF."],
  [35, 5, 9, ".F.BFB/FBBBBB/BBB..B/.B.B.B/..FFFB/FF.FFB"],
  [36, 5, 12, "B..FB./BBBBBF/BB.BBB/BB...F/BF.F.F/.FF.B."],
  [37, 5, 12, "B...../BFF.FB/BFB.BB/BBB.BB/BF..BB/FFF.B."],
  [38, 5, 12, "BBBB.B/B.BF.F/F.BF../F.B.F./FBB..F/BBBB.B"],
  [39, 5, 12, "FF.F../F.F.BB/B.FBBB/BBBBBB/BF.FFB/BF...B"],
  [40, 5, 12, "BBBBBB/BBBFBF/BB..BF/F.B.B./F.FFBF/F..FB."],
  [41, 5, 12, "BBBBBB/FF.B../F.BB../.FFBBF/.FFB../FB.BBB"],
  [42, 5, 8, ".BFB.F/BB.BF./BBBB.F/...FFF/.BFF.F/BBBBBB"],
  [43, 5, 12, "FBBB../BBBBBB/F.BB.F/.F.BFF/..BBBB/..FBFF"],
  [44, 5, 12, "FFFBF./F.FB.F/BBBBBB/FB.BFF/.FBBFF/.BBBB."],
  [45, 5, 12, "FB.BFF/BBBBBB/FBBBF./BBB.BF/.F.BF./.F.BF."],
  [46, 5, 12, "FFB.BF/FFBBB./B.BBBB/FFB.F./BB.BBF/.FB.FF"],
  [47, 5, 12, "FBFBF./BBBBFF/FBF.FF/BBBBBF/.BBB../FBFFF."],
  [48, 5, 12, "FB.BB./FF..BF/BBBBBB/FFBBBF/.FBFBF/.FBFF."],
  [49, 5, 12, "FFFF.F/BBBBBB/BF.FFB/B..BBB/BFFFBB/BF.F.F"],
  [50, 6, 24, "BF.FFBF/BFFFF../.BBBBBB/B..F.../.F..BBB/.F..BB./BBBBB.B"],
];

const replacementByNumber = new Map(replacements.map((replacement) => [replacement[0], replacement]));

export const levels: Level[] = legacyLevels.map((level) => {
  const replacement = replacementByNumber.get(level.number);
  if (!replacement) return level;
  const [, catCount, solutionCount, encodedRows] = replacement;
  const rows = encodedRows.split("/");
  return {
    ...level,
    width: rows[0].length,
    height: rows.length,
    catCount,
    cells: map(rows),
    solutionPolicy: { min: solutionCount, max: solutionCount },
    pacing: "standard",
  };
});
