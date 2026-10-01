// Counting row data structure
export interface CountingRow {
  emoji: string;
  count: number;
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
}

// Child-friendly emoji, grouped so other puzzles can borrow the parts they want
// (Take Away uses the animals and vehicles).
export const FRUIT_EMOJI = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍌', '🍉'];
export const VEHICLE_EMOJI = ['🚗', '🚌', '🚀', '✈️', '🚂', '🚲', '🚜', '🚒', '🚁', '⛵'];
export const ANIMAL_EMOJI = [
  '🐶', '🐱', '🐰', '🐻', '🐸', '🦋', '🐷', '🐮', '🐵', '🦁', '🐘', '🐢', '🐟', '🦆',
];

const EMOJI_POOL = [
  ...FRUIT_EMOJI,
  '🌟', '⭐', '🌙', '☀️',
  ...VEHICLE_EMOJI,
  ...ANIMAL_EMOJI,
  '🌸', '🌺', '🌻', '🌷',
  '🎈', '🎀', '🎁',
  '⚽', '🏀', '🎾',
  '❤️', '💙', '💚',
];

/**
 * Generate a single counting row
 */
export function generateCountingRow(seed: number, minItems: number, maxItems: number): CountingRow {
  const rng = new SeededRandom(seed);

  // Pick a random emoji
  const emoji = EMOJI_POOL[rng.nextInt(EMOJI_POOL.length)];

  // Pick a random count within the range
  const count = rng.nextIntRange(minItems, maxItems);

  return { emoji, count };
}
