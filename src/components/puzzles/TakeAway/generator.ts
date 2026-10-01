import { ANIMAL_EMOJI, VEHICLE_EMOJI } from '../Counting/generator';
import { CELL_SIZE_MM } from '../../../types/puzzle';

// Take Away puzzle data structures

/**
 * Which number the child writes in. `answer` is the classic `7 − 4 = ▢`: cross
 * out four, count what's left. `taken` is `7 − ▢ = 3`: cross out until three
 * remain, then count the crossings. `mixed` picks per row.
 */
export type BlankMode = 'answer' | 'taken' | 'mixed';

export interface TakeAwayProblem {
  emoji: string;
  start: number;
  take: number;
  answer: number;
  blank: 'answer' | 'taken';
}

/** From this many emoji up, rows are split into fives for counting in chunks. */
export const GROUP_FROM = 10;
export const GROUP_SIZE = 5;

/*
 * Row layout in mm, measured from TakeAway.module.css in the browser. Change
 * them together: the starting-number limit is whatever fits.
 */
const EMOJI_SLOT_MM = 7;
const GROUP_GAP_MM = 2.5;
/** `9 − 5 = ▢` */
const EQUATION_MM = 26.6;
const DIGIT_MM = 3.6;
/** Container and row padding, row border, and the gap before the equation. */
const ROW_OVERHEAD_MM = 13.6;

/** How many starting numbers a row can be drawn from, ending at the maximum. */
const START_RANGE = 6;

/**
 * Rows involving zero - taking nothing away, or taking everything - are worth
 * meeting but turn into trick questions if they come up often. Every other row
 * is "ordinary": something taken, something left.
 */
type RowKind = 'ordinary' | 'takeZero' | 'zeroAnswer';
const TAKE_ZERO_CHANCE = 1 / 20;
const ZERO_ANSWER_CHANCE = 1 / 15;

/** Tries at drawing a row not already on the page before picking from what's left. */
const MAX_DRAWS = 20;

const EMOJI = [...ANIMAL_EMOJI, ...VEHICLE_EMOJI];

function rowWidthMm(start: number): number {
  const groupGaps = start >= GROUP_FROM ? Math.floor((start - 1) / GROUP_SIZE) : 0;
  // A two-digit start can also put two digits in the middle number
  const extraDigits = start >= 10 ? 2 : 0;
  return ROW_OVERHEAD_MM
    + start * EMOJI_SLOT_MM
    + groupGaps * GROUP_GAP_MM
    + EQUATION_MM
    + extraDigits * DIGIT_MM;
}

/**
 * Largest starting number for a puzzle this wide: as many emoji as fit beside
 * the equation. 9 at the default width of 6, up to 19 at full width, so
 * widening the puzzle is how it gets harder.
 */
export function maxStartForWidth(gridWidth: number): number {
  let start = 2;
  while (rowWidthMm(start + 1) <= gridWidth * CELL_SIZE_MM) start++;
  return start;
}

// Seeded random number generator for reproducible puzzles
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(max: number): number {
    return Math.floor(this.next() * max);
  }

  nextIntRange(min: number, max: number): number {
    return min + this.nextInt(max - min + 1);
  }

  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

interface Sum {
  start: number;
  take: number;
}

const sumKey = ({ start, take }: Sum) => `${start}-${take}`;

function kindOf({ start, take }: Sum): RowKind {
  if (take === 0) return 'takeZero';
  if (take === start) return 'zeroAnswer';
  return 'ordinary';
}

function pickKind(rng: SeededRandom): RowKind {
  const r = rng.next();
  if (r < TAKE_ZERO_CHANCE) return 'takeZero';
  if (r < TAKE_ZERO_CHANCE + ZERO_ANSWER_CHANCE) return 'zeroAnswer';
  return 'ordinary';
}

function drawSum(
  rng: SeededRandom,
  kind: RowKind,
  minStart: number,
  maxStart: number,
  fixedStart?: number
): Sum {
  // An ordinary row needs at least 2: one to take and one to leave
  const start = fixedStart ?? rng.nextIntRange(kind === 'ordinary' ? Math.max(2, minStart) : minStart, maxStart);
  if (kind === 'takeZero') return { start, take: 0 };
  if (kind === 'zeroAnswer') return { start, take: start };
  return { start, take: rng.nextIntRange(1, start - 1) };
}

/**
 * A sum not yet on the page, ordinary ones first. Only reached when random
 * draws keep hitting repeats - a narrow, tall puzzle can use up every ordinary
 * sum, and then the rest have to involve zero.
 */
function pickUnused(
  rng: SeededRandom,
  used: Set<string>,
  minStart: number,
  maxStart: number,
  fixedStart?: number
): Sum | undefined {
  const unused: Sum[] = [];
  for (let start = fixedStart ?? minStart; start <= (fixedStart ?? maxStart); start++) {
    for (let take = 0; take <= start; take++) {
      if (!used.has(sumKey({ start, take }))) unused.push({ start, take });
    }
  }
  const shuffled = rng.shuffle(unused);
  return shuffled.find(sum => kindOf(sum) === 'ordinary') ?? shuffled[0];
}

/**
 * Generate one problem per row, no two alike. One random row always starts at
 * the most the width allows, so a wider puzzle reliably asks for more. With
 * `workedExample`, the first row is kept ordinary since it's there to show how
 * the others work. Each row gets a different emoji until the pool runs out.
 */
export function generateTakeAway(
  rowCount: number,
  gridWidth: number,
  seed: number,
  blankMode: BlankMode,
  workedExample: boolean
): TakeAwayProblem[] {
  const rng = new SeededRandom(seed);
  const maxStart = maxStartForWidth(gridWidth);
  const minStart = Math.max(1, maxStart - START_RANGE + 1);
  const emoji = rng.shuffle(EMOJI);

  // The full-size row is drawn first so it can't find its sums already taken
  const fullRow = rng.nextInt(rowCount);
  const rowOrder = [fullRow, ...Array.from({ length: rowCount }, (_, i) => i).filter(i => i !== fullRow)];

  const used = new Set<string>();
  const sums: Sum[] = [];
  for (const row of rowOrder) {
    const isExample = workedExample && row === 0;
    const kind = isExample || row === fullRow ? 'ordinary' : pickKind(rng);
    const fixedStart = row === fullRow ? maxStart : undefined;

    let sum: Sum | undefined;
    for (let i = 0; i < MAX_DRAWS && !sum; i++) {
      const drawn = drawSum(rng, kind, minStart, maxStart, fixedStart);
      if (!used.has(sumKey(drawn))) sum = drawn;
    }
    // Repeating beats failing if every sum is used, though 14 rows never get there
    sum ??= pickUnused(rng, used, minStart, maxStart, fixedStart)
      ?? drawSum(rng, kind, minStart, maxStart, fixedStart);

    used.add(sumKey(sum));
    sums[row] = sum;
  }

  return sums.map(({ start, take }, i) => ({
    emoji: emoji[i % emoji.length],
    start,
    take,
    answer: start - take,
    blank: blankMode === 'mixed' ? (rng.next() < 0.5 ? 'answer' : 'taken') : blankMode,
  }));
}
