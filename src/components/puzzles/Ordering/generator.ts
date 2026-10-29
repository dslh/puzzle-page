import { SeededRandom } from '../../../utils/random';

// Ordering puzzle data structures
export interface OrderingItem {
  value: number;      // For sorting (the actual value/size)
  display: string;    // What to show (number string or emoji)
  fontSize?: number;  // For emoji mode (in mm)
}

export interface OrderingRow {
  items: OrderingItem[];  // Already shuffled for display
  emoji?: string;         // Which emoji (emoji mode only)
}

// Child-friendly emoji pool (simple, recognizable shapes)
const EMOJI_POOL = [
  '🌟', '⭐', '🔵', '🔴', '🟢', '🟡',
  '🍎', '🍊', '🌸', '🌻', '🦋', '🐟',
  '❤️', '💙', '🎈', '🎀', '⚽', '🏀',
];

// Available sizes in mm (must be distinct and visually different)
// Supports up to 10 items (full grid width)
const EMOJI_SIZES = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

/**
 * Generate a single ordering row in numbers mode
 */
function generateNumbersRow(rng: SeededRandom, itemCount: number): OrderingRow {
  // Pick unique numbers from 1-20
  const allNumbers = Array.from({ length: 20 }, (_, i) => i + 1);
  const selectedNumbers = rng.pickUnique(allNumbers, itemCount);

  // Create items (not yet shuffled - just the data)
  const items: OrderingItem[] = selectedNumbers.map(num => ({
    value: num,
    display: String(num),
  }));

  // Shuffle for display
  const shuffledItems = rng.shuffle(items);

  return { items: shuffledItems };
}

/**
 * Generate a single ordering row in emoji mode
 */
function generateEmojiRow(rng: SeededRandom, itemCount: number): OrderingRow {
  // Pick a random emoji
  const emoji = EMOJI_POOL[rng.nextInt(EMOJI_POOL.length)];

  // Pick unique sizes
  const selectedSizes = rng.pickUnique(EMOJI_SIZES, itemCount);

  // Create items with sizes
  const items: OrderingItem[] = selectedSizes.map(size => ({
    value: size,
    display: emoji,
    fontSize: size,
  }));

  // Shuffle for display
  const shuffledItems = rng.shuffle(items);

  return { items: shuffledItems, emoji };
}

/**
 * Generate an ordering row based on mode
 */
export function generateOrderingRow(
  seed: number,
  itemCount: number,
  mode: 'numbers' | 'emoji'
): OrderingRow {
  const rng = new SeededRandom(seed);

  if (mode === 'numbers') {
    return generateNumbersRow(rng, itemCount);
  } else {
    return generateEmojiRow(rng, itemCount);
  }
}

/**
 * Calculate number of items based on grid width (one per cell)
 */
export function getItemCount(gridWidth: number): number {
  return gridWidth;
}
