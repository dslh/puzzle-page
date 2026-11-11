import { BLOCK_FONT, FONT_HEIGHT, glyphCells, glyphWidth, letterWidth } from './blockFont';

/** The longest word the box takes; about 5 letters fit across a page, on Small */
export const MAX_WORD_LENGTH = 12;
/**
 * Empty rows between the letters and the joins that run below them. One
 * isn't enough: a join a cell from a letter reads as part of it.
 */
const LANE_GAP = 2;
/** Cells kept clear around the word: below, the lane and a spare row for joins that pass */
const MARGIN_SIDE = 1;
const MARGIN_TOP = 1;
const MARGIN_BOTTOM = LANE_GAP + 2;
/** What it costs, in cells of join, to draw a letter its second way */
const VARIANT_COST = 6;
/** A letter written backwards loses ties */
const REVERSED_COST = 0.5;
/** A join that has to run between the letters, where it could be read as part of one */
const SQUEEZE_COST = 100;

/** The letters of `text` the block font can draw, in capitals, spaces kept */
export function wordLetters(text: string): string {
  return text
    .toUpperCase()
    .split('')
    .filter((c) => c === ' ' || BLOCK_FONT[c])
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
}

const span = (steps: number, scale: number) => (steps - 1) * scale + 1;
const gapFor = (scale: number) => scale + 1;

/** The word's size in cells at `scale` cells a font step, margins included */
function wordSize(word: string, scale: number): { width: number; height: number } {
  let width = 0;
  word.split('').forEach((c, i) => {
    if (i > 0) width += gapFor(scale);
    width += c === ' ' ? scale * 2 : span(letterWidth(c), scale);
  });
  return {
    width: width + 2 * MARGIN_SIDE,
    height: span(FONT_HEIGHT, scale) + MARGIN_TOP + MARGIN_BOTTOM,
  };
}

/** The smallest maze, in cells, that can spell `word` */
export function minWordCells(word: string): { width: number; height: number } {
  return wordSize(word, 1);
}

/**
 * The answer route for a maze that spells `word`, as big as the grid allows
 * in whole font steps (see blockFont.ts). Null when the word won't fit.
 *
 * Letters are joined end to start, by a join that drops straight down from
 * the bottom of one, runs along a lane LANE_GAP rows below the word, and
 * comes straight up into the next: never at letter height, where it would
 * be read as part of a letter. Joins above the word were tried, and read as
 * bars across the letters' tops (I and L joined that way look like a pi).
 * Each letter can be drawn either way round, and some have a second form
 * that starts and ends at the bottom; the choice with the shortest joins wins.
 */
export function wordRoute(text: string, width: number, height: number): number[] | null {
  const word = wordLetters(text);
  if (!word) return null;
  let scale = 0;
  while (true) {
    const size = wordSize(word, scale + 1);
    if (size.width > width || size.height > height) break;
    scale++;
  }
  if (scale === 0) return null;
  const size = wordSize(word, scale);

  // Centred
  const top = Math.floor((height - size.height) / 2) + MARGIN_TOP;
  const bottom = top + span(FONT_HEIGHT, scale) - 1;
  let x = Math.floor((width - size.width) / 2) + MARGIN_SIDE;
  const index = (cx: number, cy: number) => cy * width + cx;

  /** Each letter's ways of drawing it, as cells in route order, with what each costs */
  const letters: { cells: number[]; cost: number }[][] = [];
  for (const c of word) {
    if (c === ' ') {
      x += scale * 2 + gapFor(scale);
      continue;
    }
    const room = span(letterWidth(c), scale);
    letters.push(
      BLOCK_FONT[c].flatMap((glyph, variant) => {
        const left = x + Math.floor((room - span(glyphWidth(glyph), scale)) / 2);
        const cells = glyphCells(glyph, scale).map(([cx, cy]) => index(left + cx, top + cy));
        return [
          { cells, cost: variant * VARIANT_COST },
          { cells: [...cells].reverse(), cost: variant * VARIANT_COST + REVERSED_COST },
        ];
      })
    );
    x += room + gapFor(scale);
  }

  // Joins must keep clear of whichever form of each letter is drawn. While
  // choosing, keep clear of all of them; a little stricter than needed.
  const everyForm = new Set(letters.flat().flatMap((way) => way.cells));
  // A join leaves a letter straight down, then runs along a lane LANE_GAP
  // rows below the letters
  const inLane = (cell: number, ends: number[]) => {
    const row = Math.floor(cell / width);
    if (row > bottom + LANE_GAP) return true;
    const stalk = ends.some((end) => end % width === cell % width);
    return stalk && row > bottom;
  };
  // `near` is what a join keeps a cell clear of; it never goes through `taken`
  const join = (from: number, to: number, near: Set<number>, taken = near) => {
    const clear = (cell: number) => !taken.has(cell) && clearOf(cell, near, from, to, width, height);
    const outside = findJoin(from, to, width, height, (cell) => inLane(cell, [from, to]) && clear(cell));
    if (outside) return { cells: outside, cost: outside.length };
    const between = findJoin(from, to, width, height, clear);
    if (between) return { cells: between, cost: SQUEEZE_COST + between.length };
    const squeezed = findJoin(from, to, width, height, (cell) => !taken.has(cell));
    return squeezed ? { cells: squeezed, cost: 2 * SQUEEZE_COST + squeezed.length } : null;
  };

  // The cheapest way through, letter by letter, keeping the best path to
  // each way of drawing the latest letter (Viterbi)
  let best = letters[0].map((way, w) => ({ cost: way.cost, ways: [w] }));
  for (let i = 1; i < letters.length; i++) {
    best = letters[i].map((way, w) => {
      let pick = { cost: Infinity, ways: [] as number[] };
      for (const prev of best) {
        const from = letters[i - 1][prev.ways[i - 1]].cells.at(-1)!;
        const link = join(from, way.cells[0], everyForm);
        const cost = prev.cost + (link?.cost ?? Infinity) + way.cost;
        if (cost < pick.cost) pick = { cost, ways: [...prev.ways, w] };
      }
      return pick;
    });
  }
  const cheapest = best.reduce((a, b) => (b.cost < a.cost ? b : a));
  if (!Number.isFinite(cheapest.cost)) return null;
  const chosen = cheapest.ways.map((w, i) => letters[i][w].cells);

  // Then join them for real, each join kept clear of the ones before
  const taken = new Set(chosen.flat());
  // A letter whose ends are side by side (P) has its two joins side by side
  // too, so a join may touch the one before it, as a letter touches itself.
  const route = [...chosen[0]];
  let previous: number[] = [];
  for (let i = 1; i < chosen.length; i++) {
    const near = new Set([...taken].filter((cell) => !previous.includes(cell)));
    const link = join(route[route.length - 1], chosen[i][0], near, taken);
    if (!link) return null;
    for (const cell of link.cells) taken.add(cell);
    previous = link.cells;
    route.push(...link.cells, ...chosen[i]);
  }
  return route;
}

/** The cells beside `cell`, inside the grid */
function neighbours(cell: number, width: number, height: number): number[] {
  const [cx, cy] = [cell % width, Math.floor(cell / width)];
  return [
    cx > 0 ? cell - 1 : -1,
    cx < width - 1 ? cell + 1 : -1,
    cy > 0 ? cell - width : -1,
    cy < height - 1 ? cell + width : -1,
  ].filter((n) => n !== -1);
}

/** Free, and touching nothing taken but the two ends of the join */
function clearOf(cell: number, taken: Set<number>, from: number, to: number, width: number, height: number): boolean {
  return !taken.has(cell) && neighbours(cell, width, height).every((n) => !taken.has(n) || n === from || n === to);
}

/** The shortest way from `from` to `to` through cells that are `open`, leaving both out */
function findJoin(from: number, to: number, width: number, height: number, open: (cell: number) => boolean): number[] | null {
  const cameFrom = new Map<number, number>([[from, -1]]);
  const queue = [from];
  for (let head = 0; head < queue.length; head++) {
    const cell = queue[head];
    for (const n of neighbours(cell, width, height)) {
      if (cameFrom.has(n)) continue;
      if (n === to) {
        const path: number[] = [];
        for (let c = cell; c !== from; c = cameFrom.get(c)!) path.unshift(c);
        return path;
      }
      if (!open(n)) continue;
      cameFrom.set(n, cell);
      queue.push(n);
    }
  }
  return null;
}
