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

  pickUnique<T>(array: T[], count: number): T[] {
    const shuffled = this.shuffle(array);
    return shuffled.slice(0, count);
  }
}

// Child-friendly emoji pool (simple, recognizable shapes)
const EMOJI_POOL = [
  '🌟', '⭐', '🔵', '🔴', '🟢', '🟡',
  '🍎', '🍊', '🌸', '🌻', '🦋', '🐟',
  '❤️', '💙', '🎈', '🎀', '⚽', '🏀',
];

// Available sizes in mm (must be distinct and visually different)
const EMOJI_SIZES = [4, 6, 8, 10, 12];

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
