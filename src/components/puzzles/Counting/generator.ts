import { SeededRandom } from '../../../utils/random';

// Counting row data structure
export interface CountingRow {
  emoji: string;
  count: number;
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
