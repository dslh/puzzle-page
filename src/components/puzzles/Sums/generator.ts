// Sums puzzle data structures
export type SumsMode = 'add' | 'subtract' | 'both';

export interface SumProblem {
  left: number;
  right: number;
  operator: '+' | '−';
  answer: number;
}

/**
 * Largest number a child has to reach. Additions never total more than this and
 * subtractions never start higher than it, so every problem stays inside a
 * single-digit world.
 */
export const MAX_SUM = 9;

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
 * Every a + b whose total is at most maxSum. Both addends are at least 1 -
 * adding zero is a different lesson and reads as a trick question here.
 */
function buildAdditionPool(maxSum: number): SumProblem[] {
  const pool: SumProblem[] = [];
  for (let left = 1; left < maxSum; left++) {
    for (let right = 1; left + right <= maxSum; right++) {
      pool.push({ left, right, operator: '+', answer: left + right });
    }
  }
  return pool;
}

/**
 * Every a - b starting from at most maxSum. `right < left` keeps answers at 1 or
 * above: no negatives, and no zero answers for a child who has only just met the
 * idea of taking away.
 */
function buildSubtractionPool(maxSum: number): SumProblem[] {
  const pool: SumProblem[] = [];
  for (let left = 2; left <= maxSum; left++) {
    for (let right = 1; right < left; right++) {
      pool.push({ left, right, operator: '−', answer: left - right });
    }
  }
  return pool;
}

/**
 * Generate `count` problems. Draws from a shuffled pool of every valid problem,
 * so a page repeats a sum only once it has used all of them.
 */
export function generateSums(count: number, seed: number, mode: SumsMode): SumProblem[] {
  const rng = new SeededRandom(seed);

  const pool = [
    ...(mode === 'subtract' ? [] : buildAdditionPool(MAX_SUM)),
    ...(mode === 'add' ? [] : buildSubtractionPool(MAX_SUM)),
  ];

  const problems: SumProblem[] = [];
  while (problems.length < count) {
    problems.push(...rng.shuffle(pool));
  }

  return problems.slice(0, count);
}
