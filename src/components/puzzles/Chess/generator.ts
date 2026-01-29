import { EASY_PUZZLES, MEDIUM_PUZZLES, HARD_PUZZLES, type ChessPuzzle } from './puzzleData';

export type Difficulty = 'easy' | 'medium' | 'hard';

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

function getPuzzlePool(difficulty: Difficulty): ChessPuzzle[] {
  switch (difficulty) {
    case 'easy':
      return EASY_PUZZLES;
    case 'medium':
      return MEDIUM_PUZZLES;
    case 'hard':
      return HARD_PUZZLES;
  }
}

/**
 * Select a puzzle deterministically based on seed and difficulty
 */
export function selectPuzzle(seed: number, difficulty: Difficulty): ChessPuzzle {
  const pool = getPuzzlePool(difficulty);
  const rng = new SeededRandom(seed);
  const index = Math.floor(rng.next() * pool.length);
  return pool[index];
}
