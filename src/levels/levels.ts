import type { CellKind, Level } from "../game/types";

const map = (rows: string[]): CellKind[] =>
  rows.join("").split("").map((char): CellKind => {
    if (char === "B") return "bed";
    if (char === "F") return "furniture";
    if (char === ".") return "floor";
    throw new Error(`Unsupported board symbol: ${char}`);
  });

type Difficulty = Level["difficulty"];
type Pacing = NonNullable<Level["pacing"]>;

function defineLevel(
  number: number,
  catCount: number,
  difficulty: Difficulty,
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
    cells: map(rows),
  };
}

const legacyLevels: Level[] = [
  defineLevel(1, 1, "N0", ["F.", ".B"], "tutorial"),
  defineLevel(2, 2, "N0", ["B.B", "B.."], "tutorial"),
  defineLevel(3, 2, "N0", ["BFB", "..."], "tutorial"),
  defineLevel(4, 3, "N1", ["B.B", ".FB", "BB."], "tutorial"),
  defineLevel(5, 3, "N1", ["BFB", ".F.", "BBB"]),
  defineLevel(6, 3, "N2", [".BFB", "BB.B", ".F.."]),
  defineLevel(7, 3, "N2", [".F..", ".BFB", "BB.B", "...."]),
  defineLevel(8, 4, "N2", ["BBFB", ".FF.", "B..B", "BB.B"]),
  defineLevel(9, 4, "N3", ["B..B.", "BFFBB", "...F.", "B..BB"]),
  defineLevel(10, 4, "N3", ["BBB.B", "BFBFF", "BBB.F", ".....", "..B.F"], "peak", { min: 4, max: 4 }),
  defineLevel(11, 4, "N2", [".BB.B", ".....", "..F.B", ".B..F", "..BF."], "breather"),
  defineLevel(12, 5, "N3", ["BB.BB", "B..BF", "....F", "BBFBF", "BB.BB"]),
  defineLevel(13, 4, "N3", ["F....", "BF..B", "F....", "F..BB", "B..BB"]),
  defineLevel(14, 5, "N3", [".BF..B", ".FF.BB", "FBB.BB", "..B.BB", "....F."]),
  defineLevel(15, 6, "N4", [".FF...", "B.BB.F", ".FB..B", "FB..FB", "BBBB..", ".BBB.B"]),
  defineLevel(16, 5, "N2", ["...FB", ".FBBB", ".F...", ".BFB.", "..B.."], "breather"),
  defineLevel(17, 5, "N4", ["F...BB", ".B.FBF", ".F.FBB", ".B..BB", "......"]),
  defineLevel(18, 5, "N4", ["......", ".BB...", "BFBF.B", "BBB...", "..F.FF", ".F...."]),
  defineLevel(19, 7, "N4", [".F.FFB", "FF.B..", ".BFFBB", "...BB.", "B.B.BB", "BB.BBB"]),
  defineLevel(20, 5, "N4", ["F.FF..", "FB.BBB", ".BFB.B", ".BBBBB", "..FB..", "F..FF."], "peak", { min: 1, max: 1 }),
  defineLevel(21, 5, "N3", ["F.....", "..F..F", "....B.", ".BFBFB", ".B.BBB"], "breather"),
  defineLevel(22, 6, "N4", ["FF....", "B.FBF.", ".F...F", "..BBBB", "BBFB.B", "BB.BBB"]),
  defineLevel(23, 6, "N4", ["..F..BF", "B...B.F", "BB..B.B", "BBFFB..", "..FFF..", "BB..BB."]),
  defineLevel(24, 7, "N5", ["F....F.", "FFFBBFB", "....B..", "F...FBB", "F..BB.B", ".B....B", "B..BBBB"]),
  defineLevel(25, 8, "N5", [".FBF..F", ".FBBF..", "BBFBB..", "..B.B..", "B..B.F.", "F.F.BB.", "..BBBBF"], "peak"),
  defineLevel(26, 6, "N3", ["..F...", ".BB.BB", ".BFFB.", "..B.FB", "....B.", "F....F"], "breather"),
  defineLevel(27, 7, "N5", ["FBB.FBF", "FB..FBB", "...B.BB", "..F....", "F.FBBBF", "..BBBB."]),
  defineLevel(28, 6, "N5", ["...B...", "..FB.B.", "B..FB..", "...BB.F", "BB.BBB.", "FFFF.F.", "....F.F"]),
  defineLevel(29, 8, "N5", ["FF...F..", "BBF...BB", "B.BF.F.F", "FBB..B..", "B..FFB.B", "B.B...BB", "..B..F.."]),
  defineLevel(30, 8, "N5", ["......FB", ".....B.B", "BFFB..B.", "F..FF.BB", "..F....F", "F..BBBBF", "B..F....", "B...BBBF"], "peak"),
  defineLevel(31, 6, "N4", ["BB.F..", "F....F", "B..FBB", ".B....", "F....B", "..F..F", ".....B"], "breather"),
  defineLevel(32, 7, "N5", ["FF.BFB.", "FB.B.B.", ".F...FF", "....BF.", "BB.B.BF", "BB..BF.", "B..BB.."]),
  defineLevel(33, 7, "N5", ["..F..BB.", "F.....BF", "..F..F..", "BBFFFB.F", "B.....FF", "BB.B.B.B", "BB.B.B.."]),
  defineLevel(34, 9, "N5", ["......F.", ".B.FF...", "BFFF....", "FB.F..B.", "..FFFB.B", "FB.BF.BB", "BB..BBB.", "B..B..B."]),
  defineLevel(35, 8, "N6", ["..FFBB.F", "FFF..B..", "...B.FB.", "F...FF.B", "F...BB.B", "F...B.BB", "..BBB.B.", ".F.....F"], "peak"),
  defineLevel(36, 7, "N4", ["..B..FB", "B..B..B", "B..F...", "F.F....", ".FFF...", "..B....", "BF..BF."], "breather"),
  defineLevel(37, 8, "N5", [".F....F.", "..B.FBFF", "BBB.F.BF", "F.BBF.F.", "F...FB.B", "......BB", ".BBB.B.B"]),
  defineLevel(38, 7, "N6", ["...FFFF.", "BBF.FFB.", "..F.F..F", ".......F", ".BF.B..B", "B..BB...", "BB..B.B.", ".FBB...F"]),
  defineLevel(39, 9, "N6", ["..F..B.F.", "F.FB..F..", "FBFFB.F..", "....F.BFF", "F.FBBF...", ".BBB..B..", ".B.BBBB..", ".B.B....."]),
  defineLevel(40, 9, "N6", ["B....F.FF", "...F.....", "..FFBBBBF", "FB...B...", "..B..F.B.", "F.F....F.", "BBF.B..F.", "..F...BF.", "BB..B.BB."], "peak"),
  defineLevel(41, 7, "N4", ["...B.BF", "F.....F", ".BB.F..", ".F.F..F", ".......", "BF.BFB.", "..B...B", ".F....B"], "breather"),
  defineLevel(42, 8, "N5", ["FFFF.B.F", "...FB.FB", "B.....BB", "B.B..B..", ".FFBB..B", "..BBFBBB", "..F.....", ".F.F..F."]),
  defineLevel(43, 8, "N6", ["..F....FB", "...BFFF.F", "BBF.B..FF", "B.BBB.F..", "B...F.B..", "BBBB....B", "..FF..F.F", ".F......."]),
  defineLevel(44, 10, "N6", [".BFF..FBF", "F.F......", ".F.FBB...", "BBBF.BF..", "FB.F..F.F", "B.....B..", "..B......", "FB...BBB.", "B...BBFF."]),
  defineLevel(45, 9, "N6", ["..BFFBF.B", "FFF.F.BB.", "....BBFBB", "...F..BBF", "F..BBBBB.", "..F......", ".......FF", ".........", "FF...FBBF"], "peak"),
  defineLevel(46, 8, "N5", ["......F.", ".BB..BFB", "..B.....", ".B..F.F.", ".FFF.BBB", "FB....FF", ".F.F.BBF", "..B..B.."], "breather"),
  defineLevel(47, 10, "N6", [".....B..F", ".F...FB..", "..FFFFF..", ".F...F...", "BB.F.BB..", "B....BBFB", "..BF.BFF.", "BB.BBB...", ".B..BFF.F"]),
  defineLevel(48, 8, "N6", ["F..B...BF", "...F....F", "BBF.B..BF", "...F..F..", ".F.BB..B.", "B.F.BB...", ".B..B..F.", ".FF.B...F", "FF..F.FF."]),
  defineLevel(49, 10, "N6", [".FBFB....F", ".F.F...F..", "FB..FB..BF", "F.B.B....B", ".F.......F", "FB....BF.F", "...BB...F.", ".BFB.BBF..", "F...B.B..F"]),
  defineLevel(50, 11, "N6", ["FF.....F.F", "F..F.BF..F", ".BB..FBB..", "F.B.F.BF..", "....BB.B..", "BF..BBB.B.", "....FB.BF.", ".FBBF.F...", "...F.F.B.F", "..F.F....."], "finale"),
];

type Replacement = readonly [number, number, number, string];

const replacements: Replacement[] = [
  [11, 5, 4, "...B../.BBB../..FB../.BBB../BBBB.B/..BB.."],
  [12, 5, 12, "..BFB./BB.BBB/BBBB.B/.B..B./..B.../......"],
  [13, 5, 12, "....../BFBBB./BBB.../BB.B.B/BB..../BB...."],
  [14, 5, 15, "..B.../..BB.B/.BB.BB/BBBBFB/..BB../......"],
  [15, 5, 10, "BBBBB./B.BB../F.B.../BFB.../B.BB../B.B..."],
  [16, 5, 16, "....../BB.FB./BBB.../B.BBBB/BB.FB./B....."],
  [17, 5, 12, "BBB.BB/.FB.../BBBBF./BFB.../....../B.B.B."],
  [18, 5, 15, ".BBFB./BBBBB./.BF.B./..BBBB/....B./......"],
  [19, 5, 16, "B.FBB./B.FB../.BBBBB/BB.BB./B.FB../B....."],
  [20, 7, 1, ".BBBBF.B/.B.B..../B.B..FBB/.B..B.../.B......"],
  [21, 7, 1, "...BB.../..BB..../BBB.BFBB/B.B.BFB./...B...."],
  [22, 7, 1, "B..B..../B.B...../BBBB.FB./BBBBBF.B/B......."],
  [23, 7, 1, "BB..BFB./B..BBF.B/BBB...../..B...../.BB....."],
  [24, 7, 1, ".B.BBFBB/B.B...../B.B.B.../BBB.BFB./B......."],
  [25, 8, 1, "..B.B..../.B.BB..../BBB.B.F.B/B..BBBFB./...BB..../....B...."],
  [26, 8, 1, ".B......./....B..../.BB....../BB.BBBF.B/.BB.BB.../.BBBBBFB."],
  [27, 8, 1, "...B...../..B....../BBBBBBFBB/B.B..B.../BBBB.BFB./B.BB....."],
  [28, 8, 1, "..BBB..../.B......./.BB.B..../BBBBBBF.B/.B..B..../.B.BBBFB."],
  [29, 8, 1, "..BB...../.BBB...../...B...../BBBB...../BBBBB.F.B/B.BBBBFBB"],
  [30, 9, 1, "BB......../BBBBB.BF.B/BB.B....../BBB..BBFB./BB....B.../BBBB..B.../B........."],
  [31, 9, 1, ".B......../B.BBBBBF.B/B..BB.B.../.B..B...../.B.BB...../B...BBBFB./.B..B.B..."],
  [32, 9, 1, "....B...../..B.B.B.../....B.B.../B.B.BBB.../BBB.BBBFB./BBBB.BBF.B/....BBB..."],
  [33, 9, 1, ".BBBB.BFB./.BB.BB..../BB..BBBFBB/.BB..B..../..B......./.BBBBB..../..B..B...."],
  [34, 9, 1, "..BB..B.../......B.../.BBBBB.FB./.BBB..B.../.BBB.BB.../..B...B.../BBBBBB.F.B"],
  [35, 10, 1, "B.BBBB...../...B......./B...B....../B..BBB...../B.B.BBBBF.B/B.BB.B.B.../B..B......./BBBBBB..FBB"],
  [36, 10, 1, "BB..B.BB.../....B..B.../B.BBB...FB./B.BB.BBBFBB/BB.BB.BB.../....B....../.B..B..B.../....B.B...."],
  [37, 10, 1, ".....B.B.../B.BBBB.BF.B/BB..BB.B.../B....B.B.../BBBBBBBBFBB/.B.....B.../BB.BBB.B.../.......B..."],
  [38, 10, 1, "....B.BB.../B.BBBBBBF.B/......BB.../.......B.../..BBB.B..../B..BB.BB.../BBBBBBBBFBB/...BB.BB..."],
  [39, 10, 1, "......B..../......BB.../BBBBBBBBFBB/BBBBB.BBF.B/..BBB.BB.../B.B.B.BB.../..B...BB.../..BB..BB..."],
  [40, 10, 1, ".....B...../BBBBBBBBFBB/B...BB.B.../.....B.B.../B....B.B.../BB.BBBBBFB./B..BBBBB.../B..BBB.B..."],
  [41, 10, 1, ".BB.B.B.B../..BB.BBBB../.B........./.B......B../BBBBB.BBBFB/.B.BB.B.B../.B.BBBB.B../.B..B.B.B../.B..B...B.."],
  [42, 10, 1, "B........../.BBB..BBB../BBB......../...B......./BBB...B.B../BB.B......./BBBB..B..../BBBBB.BBB../BBBBBBBBBFB"],
  [43, 10, 1, ".B.B...B.../BBB.BB..B../BBBB.BBBBFB/.BBB...B.../.BBB...BB../.......B.../.BBBB..BB../.B.....B.../.BBB.B.BB.."],
  [44, 10, 1, "B.BBBBBBBFB/.BBB...B.../.BBBB.BB.../.BB...BB.../.BBBB.BBB../...B......./.B.B...B.../BBBBB.BB.../.B.B......."],
  [45, 10, 1, "...BBB.BBFB/.....B...../BBBB.BB.B../B.BBBBB.B../.BB..B..B../.B...B..B../BBB..BB.B../.....B..B../B.B.....B.."],
  [46, 10, 1, "BBBBBB.BB../BB.BBBBBBFB/B....B..B../.....B..B../.....B...../B.B..B...../BBB..B.BB../.BB..B..B../BBBB...BB.."],
  [47, 10, 1, "B.BB..B.B../B.B...B.B../BBBBBBBBBFB/..BBBB.B.../B.BBB...B../........B../..B.....B../B.BBB.BBB../B.B.....B.."],
  [48, 10, 1, "BBB.BBBBBFB/BBB....BB../BBB.....B../BBBBB..BB../.B........./BBBB...BB../.B......B../B.BBB.BBB../BB......B.."],
  [49, 10, 1, "........B../B...B...B../BB..B.BBB../BB..B..BB../BBBBBBBBBFB/BBB.B.BBB../B...B..BB../....B...B../BBB.BBBBB.."],
  [50, 11, 1, "....BBB...B/..BBBB.BB../.B.....B.BB/B.B.BB.B.../.B.B...B.../B...BBB..B./...B.....B./.B.B.....B./.F......FB./.F....B..BB/....B.B...B"],
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
    solutionPolicy: level.number === 50
      ? { min: 1, max: 1 }
      : solutionCount === 1 ? undefined : { min: solutionCount, max: solutionCount },
    difficulty: level.number <= 14 ? "N3" : level.number <= 19 ? "N4" : level.number <= 29 ? "N5" : "N6",
    pacing: level.number === 50 ? "finale" : "standard",
  };
});
