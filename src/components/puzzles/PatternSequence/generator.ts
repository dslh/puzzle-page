// Pattern types
export type PatternType = 'alternating' | 'repeating';

// Pattern data structure
export interface PatternSequence {
  colors: (string | null)[]; // null represents the blank circle
  answer: string; // The correct color for the blank
  type: PatternType;
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

  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

// Available colors (matching Sudoku colors)
const COLORS = ['red', 'green', 'blue', 'yellow'];

/**
 * Generate a single pattern sequence puzzle
 */
export function generatePatternSequence(seed: number, type?: PatternType): PatternSequence {
  const rng = new SeededRandom(seed);

  // Use provided type or randomly choose pattern type (50/50 alternating vs repeating)
  const patternType: PatternType = type ?? (rng.next() < 0.5 ? 'alternating' : 'repeating');

  if (patternType === 'alternating') {
    // AB pattern (e.g., red-blue-red-blue-red-?)
    // Vary length: 4, 5, or 6 items before blank (5 ± 1)
    const patternLength = 4 + rng.nextInt(3);

    // Pick 2 random colors
    const shuffled = rng.shuffle(COLORS);
    const colorA = shuffled[0];
    const colorB = shuffled[1];

    // Build the pattern
    const colors: (string | null)[] = [];
    for (let i = 0; i < patternLength; i++) {
      colors.push(i % 2 === 0 ? colorA : colorB);
    }

    // The answer is what comes next in the pattern
    const answer = patternLength % 2 === 0 ? colorA : colorB;

    // Add the blank at the end
    colors.push(null);

    return { colors, answer, type: patternType };
  } else {
    // ABC pattern (e.g., red-blue-green-red-blue-green-?)
    // Vary length: 5, 6, or 7 items before blank (6 ± 1)
    const patternLength = 5 + rng.nextInt(3);

    // Pick 3 random colors
    const shuffled = rng.shuffle(COLORS);
    const pattern = shuffled.slice(0, 3);

    // Build the sequence
    const colors: (string | null)[] = [];
    for (let i = 0; i < patternLength; i++) {
      colors.push(pattern[i % 3]);
    }

    // The answer is what comes next in the pattern cycle
    const answer = pattern[patternLength % 3];

    // Add the blank at the end
    colors.push(null);

    return { colors, answer, type: patternType };
  }
}
