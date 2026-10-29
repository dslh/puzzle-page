import { SeededRandom } from '../../../utils/random';

export type MissingNumbersLayout = 'track' | 'square';
export type MissingNumbersRange = 20 | 50 | 100;
export type MissingNumbersStep = 1 | 2 | 5 | 10;
export type MissingNumbersDirection = 'forwards' | 'backwards';
export type MissingNumbersGaps = 'few' | 'some' | 'lots';

/** A box on the page: its number, and whether the child writes it. */
export interface NumberCell {
  value: number;
  blank: boolean;
}

/** Share of the open boxes left blank, by setting. */
const GAP_SHARE: Record<MissingNumbersGaps, number> = {
  few: 0.25,
  some: 0.5,
  lots: 0.75,
};

/**
 * Pick blanks from `candidates` (indices into the cells), trying `priority`
 * ones first, and keeping only those `allowed` says still leave the puzzle
 * solvable. Stops at `count`, or sooner if nothing else fits.
 */
function pickBlanks(
  rng: SeededRandom,
  candidates: number[],
  priority: (i: number) => boolean,
  count: number,
  allowed: (i: number, blanks: Set<number>) => boolean,
): Set<number> {
  // A weighted shuffle: the hard ones come up about twice as often, without
  // every one of them going blank (a 100 square would lose whole columns)
  const ordered = candidates
    .map(i => ({ i, key: rng.next() ** (priority(i) ? 0.5 : 1) }))
    .sort((a, b) => b.key - a.key)
    .map(({ i }) => i);

  const blanks = new Set<number>();
  for (const i of ordered) {
    if (blanks.size >= count) break;
    if (allowed(i, blanks)) blanks.add(i);
  }
  return blanks;
}

/** Where a number starts a new ten from the one before it, as 29 to 30. */
function crossesTen(previous: number, value: number): boolean {
  return Math.floor(previous / 10) !== Math.floor(value / 10);
}

/**
 * One track: `length` numbers counting in `step`s, all within 0 to `range`,
 * read left to right. The first two are always given, so the child can see
 * the step and the direction before the first gap.
 */
function generateTrack(
  rng: SeededRandom,
  length: number,
  range: MissingNumbersRange,
  step: MissingNumbersStep,
  direction: MissingNumbersDirection,
  gaps: MissingNumbersGaps,
  usedStarts: Set<number>,
): NumberCell[] {
  // Starts are multiples of the step, so 2s run 0, 2, 4 and 5s run 5, 10, 15
  const lastStart = range - (length - 1) * step;
  const starts = Array.from({ length: Math.floor(lastStart / step) + 1 }, (_, i) => i * step);

  // Counting in 1s, lean towards runs that cross a ten after the first two
  // boxes, where the slips are (29, 20 or 29, 210)
  let pool = starts;
  if (step === 1 && rng.next() < 0.75) {
    const crossing = starts.filter(s => {
      for (let i = 2; i < length; i++) {
        const value = direction === 'forwards' ? s + i : s + length - 1 - i;
        const previous = direction === 'forwards' ? value - 1 : value + 1;
        if (crossesTen(previous, value)) return true;
      }
      return false;
    });
    if (crossing.length > 0) pool = crossing;
  }
  const fresh = pool.filter(s => !usedStarts.has(s));
  if (fresh.length > 0) pool = fresh;
  const start = pool[rng.nextInt(pool.length)];
  usedStarts.add(start);

  const values = Array.from({ length }, (_, i) => start + i * step);
  if (direction === 'backwards') values.reverse();

  const candidates = Array.from({ length: length - 2 }, (_, i) => i + 2);
  const count = Math.max(1, Math.round(candidates.length * GAP_SHARE[gaps]));
  // Two gaps side by side only on Lots, and never three: otherwise each
  // blank sits between two numbers to count on from or back to
  const blanks = pickBlanks(
    rng,
    candidates,
    i => crossesTen(values[i - 1], values[i]),
    count,
    (i, chosen) => {
      const before = chosen.has(i - 1);
      const after = chosen.has(i + 1);
      if (gaps !== 'lots') return !before && !after;
      return !(before && after)
        && !(before && chosen.has(i - 2))
        && !(after && chosen.has(i + 2));
    },
  );

  return values.map((value, i) => ({ value, blank: blanks.has(i) }));
}

export interface TrackPuzzle {
  layout: 'track';
  rows: NumberCell[][];
}

export interface SquarePuzzle {
  layout: 'square';
  rows: NumberCell[][];
}

export type MissingNumbersPuzzle = TrackPuzzle | SquarePuzzle;

/**
 * A window on the 100-square (rows of ten, 1 to 10 on top), up to `range`.
 * Its top-left two-by-two is always given, so the child sees one more
 * across and ten more down. Every blank keeps a given number beside it,
 * above or below.
 */
function generateSquare(
  rng: SeededRandom,
  columns: number,
  rows: number,
  range: MissingNumbersRange,
  gaps: MissingNumbersGaps,
): NumberCell[][] {
  const cols = Math.min(columns, 10);
  const height = Math.min(rows, range / 10);
  const firstCol = rng.nextInt(10 - cols + 1);
  const firstRow = rng.nextInt(range / 10 - height + 1);

  const valueAt = (i: number) =>
    (firstRow + Math.floor(i / cols)) * 10 + firstCol + (i % cols) + 1;
  const neighbours = (i: number) => {
    const r = Math.floor(i / cols);
    const c = i % cols;
    const list: number[] = [];
    if (c > 0) list.push(i - 1);
    if (c < cols - 1) list.push(i + 1);
    if (r > 0) list.push(i - cols);
    if (r < height - 1) list.push(i + cols);
    return list;
  };

  const total = cols * height;
  const anchors = new Set([0, 1, cols, cols + 1]);
  const candidates = Array.from({ length: total }, (_, i) => i).filter(i => !anchors.has(i));
  const count = Math.max(1, Math.round(candidates.length * GAP_SHARE[gaps] * 0.6));

  // A blank must keep a given neighbour, and must not take the last given
  // neighbour from a blank already chosen
  const hasGivenNeighbour = (i: number, blanks: Set<number>) =>
    neighbours(i).some(n => !blanks.has(n));
  const blanks = pickBlanks(
    rng,
    candidates,
    // The ends of a row, 30 then 31, are where the tens change
    i => valueAt(i) % 10 === 0 || valueAt(i) % 10 === 1,
    count,
    (i, chosen) => {
      const next = new Set(chosen).add(i);
      return hasGivenNeighbour(i, next)
        && neighbours(i).every(n => !chosen.has(n) || hasGivenNeighbour(n, next));
    },
  );

  return Array.from({ length: height }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      const i = r * cols + c;
      return { value: valueAt(i), blank: blanks.has(i) };
    }),
  );
}

export function generateMissingNumbers(
  gridWidth: number,
  gridHeight: number,
  seed: number,
  layout: MissingNumbersLayout,
  range: MissingNumbersRange,
  step: MissingNumbersStep,
  direction: MissingNumbersDirection,
  gaps: MissingNumbersGaps,
): MissingNumbersPuzzle {
  const rng = new SeededRandom(seed);

  if (layout === 'square') {
    return { layout, rows: generateSquare(rng, gridWidth, gridHeight, range, gaps) };
  }

  // One box a grid cell, one track a grid row. Counting in 10s to 20 has
  // only 0, 10, 20, so a track can be shorter than the width.
  const length = Math.min(gridWidth, Math.floor(range / step) + 1);
  const usedStarts = new Set<number>();
  return {
    layout,
    rows: Array.from({ length: gridHeight }, () =>
      generateTrack(rng, length, range, step, direction, gaps, usedStarts)),
  };
}
