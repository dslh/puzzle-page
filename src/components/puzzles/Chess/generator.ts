import {
  EASY_PUZZLES, MEDIUM_PUZZLES, HARD_PUZZLES,
  CAPTURE_EASY_PUZZLES, CAPTURE_MEDIUM_PUZZLES, CAPTURE_HARD_PUZZLES,
  type ChessPuzzle,
} from './puzzleData';

export type Difficulty = 'easy' | 'medium' | 'hard';
export type PuzzleMode = 'mate' | 'capture' | 'both';

/**
 * Simple seeded random number generator
 */
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

function getPuzzlePool(difficulty: Difficulty, mode: PuzzleMode): ChessPuzzle[] {
  const matePools = { easy: EASY_PUZZLES, medium: MEDIUM_PUZZLES, hard: HARD_PUZZLES };
  const capturePools = { easy: CAPTURE_EASY_PUZZLES, medium: CAPTURE_MEDIUM_PUZZLES, hard: CAPTURE_HARD_PUZZLES };

  switch (mode) {
    case 'mate':
      return matePools[difficulty];
    case 'capture':
      return capturePools[difficulty];
    case 'both':
      return [...matePools[difficulty], ...capturePools[difficulty]];
  }
}

/**
 * Select a puzzle deterministically based on seed, difficulty, and mode
 */
export function selectPuzzle(seed: number, difficulty: Difficulty, mode: PuzzleMode = 'mate'): ChessPuzzle {
  const pool = getPuzzlePool(difficulty, mode);
  const rng = new SeededRandom(seed);
  const index = Math.floor(rng.next() * pool.length);
  return pool[index];
}
