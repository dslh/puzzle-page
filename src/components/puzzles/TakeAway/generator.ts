import { ANIMAL_EMOJI, VEHICLE_EMOJI } from '../Counting/generator';

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

/** Emoji a row can afford per grid cell of puzzle width. */
const EMOJI_PER_CELL = 2;

/** Grid cells reserved on the right of each row for `7 − 4 = ▢`. */
const EQUATION_CELLS = 2.5;

/** How many starting numbers a row can be drawn from, ending at the maximum. */
const START_RANGE = 6;

/**
 * Taking away nothing is worth meeting, but it's a trick question if it turns up
 * often. Zero *answers* need no special handling - they come up naturally
 * whenever the whole row is taken.
 */
const TAKE_ZERO_CHANCE = 1 / 20;

const EMOJI = [...ANIMAL_EMOJI, ...VEHICLE_EMOJI];

/**
 * Largest starting number for a puzzle this wide: whatever fits beside the
 * equation. 9 at the default width of 7, rising by two per extra cell, so
 * widening the puzzle is how it gets harder.
 */
export function maxStartForWidth(gridWidth: number): number {
  return Math.max(2, Math.floor(EMOJI_PER_CELL * (gridWidth - EQUATION_CELLS)));
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
