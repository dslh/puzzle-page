/**
 * A bold block alphabet for mazes whose way through spells a word.
 *
 * A maze route can never use a cell twice, so it can't go back along a line
 * the way a pencil goes back up the stem of n. Each letter is one line that
 * comes back beside itself instead, a cell over: E's bars and T's stem are
 * drawn twice, side by side, so the letters come out bold.
 *
 * Only where a letter branches (H, K, the stems of T and Y, E's middle bar)
 * does the line have to come back like that; the rest are single lines.
 *
 * Each letter is a line through points on a grid FONT_HEIGHT tall (y down),
 * every step straight across, straight down, or at 45 degrees (drawn as a
 * staircase). A letter may be used either way round: word.ts picks the way,
 * and the form, that joins it to its neighbours best.
 */

export const FONT_HEIGHT = 7;

export type Glyph = [number, number][];

const g = (path: string): Glyph =>
  path.trim().split(/\s+/).map((pair) => pair.split(',').map(Number) as [number, number]);

/**
 * Each letter's ways of drawing it, best first. The first is the cleanest,
 * single lines where it can. Joins run below the word, so a letter in the
 * middle of one has to start and end on the bottom row; where the first
 * form doesn't, a second does, coming back beside itself to get there.
 */
export const BLOCK_FONT: Record<string, Glyph[]> = {
  A: [g('0,6 0,0 4,0 4,3 1,3 1,4 4,4 4,6')],
  B: [g('0,6 0,0 3,0 3,2 1,2 1,3 4,3 4,5 1,5 1,6 4,6')],
  C: [g('4,0 0,0 0,6 4,6'), g('0,6 0,0 4,0 4,1 1,1 1,6 4,6')],
  D: [g('0,6 0,0 3,0 3,1 4,1 4,5 3,5 3,6 2,6')],
  E: [g('4,0 0,0 0,3 3,3 3,4 0,4 0,6 4,6'), g('0,6 0,0 4,0 4,1 1,1 1,3 4,3 4,4 1,4 1,6 4,6')],
  F: [g('4,0 0,0 0,3 3,3 3,4 0,4 0,6'), g('0,6 0,0 4,0 4,1 1,1 1,3 4,3 4,4 1,4 1,6')],
  G: [g('0,6 0,0 4,0 4,1 1,1 1,6 3,6 3,3 4,3 4,6')],
  H: [g('0,6 0,0 1,0 1,3 4,3 4,0 5,0 5,6')],
  I: [g('0,0 0,6'), g('0,6 0,0 1,0 1,6')],
  J: [g('0,6 3,6 3,0 4,0 4,6')],
  K: [g('0,6 0,0 1,0 1,2 2,2 2,1 3,1 3,0 4,0 4,2 3,2 3,3 2,3 2,4 3,4 3,5 4,5 4,6')],
  L: [g('0,0 0,6 4,6'), g('0,6 0,0 1,0 1,6 4,6')],
  M: [g('0,6 0,0 1,0 3,2 5,0 6,0 6,6')],
  N: [g('0,6 0,0 1,0 1,2 2,2 2,4 3,4 3,6 4,6 4,0'), g('0,6 0,0 1,0 1,1 2,1 2,2 3,2 3,6 4,6 4,0 5,0 5,6')],
  O: [g('0,6 0,0 4,0 4,6 2,6')],
  P: [g('0,6 0,0 4,0 4,3 1,3 1,6')],
  Q: [g('0,6 0,0 4,0 4,6 3,6 3,5 2,5 2,6 1,6')],
  R: [g('0,6 0,0 4,0 4,2 1,2 1,3 2,3 2,4 3,4 3,5 4,5 4,6')],
  S: [g('4,0 0,0 0,3 4,3 4,6 0,6'), g('0,6 3,6 3,4 0,4 0,0 4,0 4,1 1,1 1,3 4,3 4,6')],
  T: [g('0,0 2,0 2,6 3,6 3,0 4,0'), g('1,6 1,1 0,1 0,0 4,0 4,1 2,1 2,6')],
  U: [g('0,0 0,6 4,6 4,0'), g('0,6 0,0 1,0 1,6 4,6 4,0 5,0 5,6')],
  V: [g('0,0 0,4 2,6 4,4 4,0'), g('2,6 1,6 1,5 0,5 0,0 1,0 1,3 2,3 2,4 3,4 3,3 4,3 4,0 5,0 5,5 4,5 4,6 3,6')],
  W: [g('0,0 0,6 1,6 3,4 5,6 6,6 6,0'), g('0,6 0,0 1,0 1,6 3,6 3,3 4,3 4,6 6,6 6,0 7,0 7,6')],
  X: [
    g('0,0 0,1 1,1 1,2 2,2 2,4 1,4 1,5 0,5 0,6 6,6 6,5 5,5 5,4 3,4 3,2 4,2 4,1 5,1 5,0 6,0'),
    g('0,6 0,5 1,5 1,4 2,4 2,2 1,2 1,1 0,1 0,0 2,0 2,1 3,1 3,2 4,2 4,1 5,1 5,0 6,0 6,2 5,2 5,3 4,3 4,5 5,5 5,6 6,6'),
  ],
  Y: [
    g('0,0 0,1 1,1 1,2 2,2 2,6 3,6 3,2 4,2 4,1 5,1 5,0'),
    g('2,6 2,3 1,3 1,2 0,2 0,0 1,0 1,1 2,1 2,2 3,2 3,1 4,1 4,0 5,0 5,2 4,2 4,3 3,3 3,6'),
  ],
  Z: [g('0,0 4,0 4,1 0,5 0,6 4,6')],
};

/** A glyph's width in font steps, plus one: letters vary, so M and W get room for their middles */
export const glyphWidth = (glyph: Glyph): number => Math.max(...glyph.map(([x]) => x)) + 1;

/** The width of a letter's widest way of drawing it, which is the room it gets */
export const letterWidth = (c: string): number => Math.max(...BLOCK_FONT[c].map(glyphWidth));

/** Every cell of a glyph's line in order, at `scale` cells per font step, from (0, 0) */
export function glyphCells(glyph: Glyph, scale: number): [number, number][] {
  const cells: [number, number][] = [[glyph[0][0] * scale, glyph[0][1] * scale]];
  for (let i = 1; i < glyph.length; i++) {
    const [tx, ty] = [glyph[i][0] * scale, glyph[i][1] * scale];
    let [x, y] = cells[cells.length - 1];
    const sx = Math.sign(tx - x);
    const sy = Math.sign(ty - y);
    // A slant goes across a step, then down a step: a staircase of `scale` cells a tread
    const stairs = sx !== 0 && sy !== 0;
    while (x !== tx || y !== ty) {
      if (stairs) {
        for (let k = 0; k < scale && x !== tx; k++) cells.push([(x += sx), y]);
        for (let k = 0; k < scale && y !== ty; k++) cells.push([x, (y += sy)]);
      } else {
        x += sx;
        y += sy;
        cells.push([x, y]);
      }
    }
  }
  return cells;
}
