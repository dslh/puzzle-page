/**
 * The seeded random numbers every puzzle generates from: the same seed always
 * gives the same puzzle, which is what lets a page be saved as seeds and
 * rebuilt, and a puzzle resized without changing.
 *
 * Mulberry32: about four billion states, and seeds next to each other give
 * unrelated draws. It replaced an LCG copied into each generator, whose single
 * 233280-state cycle made seeds replay each other's draws, so puzzles that
 * throw away many tries kept repeating on reroll.
 */
export class SeededRandom {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  /** A float in [0, 1). */
  next(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** An integer in [0, max). */
  nextInt(max: number): number {
    return Math.floor(this.next() * max);
  }

  /** An integer in [min, max], both included. */
  nextIntRange(min: number, max: number): number {
    return min + this.nextInt(max - min + 1);
  }

  /** A float in [min, max). */
  nextFloat(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  pick<T>(array: readonly T[]): T {
    return array[this.nextInt(array.length)];
  }

  /** A shuffled copy; the original is left alone. */
  shuffle<T>(array: readonly T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /** `count` different items, in random order. */
  pickUnique<T>(array: readonly T[], count: number): T[] {
    return this.shuffle(array).slice(0, count);
  }
}
