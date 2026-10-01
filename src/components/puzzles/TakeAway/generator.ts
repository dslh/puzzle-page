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
 * Taking away nothing is worth meeting, but it's a trick question if it turns up
 * often. Zero *answers* need no special handling - they come up naturally
 * whenever the whole row is taken.
 */
const TAKE_ZERO_CHANCE = 1 / 20;

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

/**
 * Generate one problem per row. Each row gets a different emoji until the pool
 * runs out. With `workedExample`, the first row is kept ordinary - something
 * taken, something left - since it's there to show how the others work.
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

  return Array.from({ length: rowCount }, (_, i) => {
    const isExample = workedExample && i === 0;

    const start = rng.nextIntRange(isExample ? Math.max(2, minStart) : minStart, maxStart);
    const take = isExample
      ? rng.nextIntRange(1, start - 1)
      : rng.next() < TAKE_ZERO_CHANCE ? 0 : rng.nextIntRange(1, start);
    const blank = blankMode === 'mixed'
      ? (rng.next() < 0.5 ? 'answer' : 'taken')
      : blankMode;

    return { emoji: emoji[i % emoji.length], start, take, answer: start - take, blank };
  });
}
