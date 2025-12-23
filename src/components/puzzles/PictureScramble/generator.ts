export interface ScrambledQuadrant {
  originalPosition: number;  // 0-3 (which quadrant from original image)
  rotation: number;          // 0, 90, 180, 270
}

export interface ScrambledPuzzle {
  quadrants: ScrambledQuadrant[];
}

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

export function generateScramble(seed: number): ScrambledPuzzle {
  const random = new SeededRandom(seed);

  // Create quadrants array [0, 1, 2, 3]
  // 0 = top-left, 1 = top-right, 2 = bottom-left, 3 = bottom-right
  const positions = [0, 1, 2, 3];

  // Shuffle positions to scramble the quadrants
  const shuffled = random.shuffle(positions);

  // Assign random rotations to each quadrant
  const quadrants = shuffled.map(originalPosition => ({
    originalPosition,
    rotation: random.nextInt(4) * 90,  // 0, 90, 180, or 270
  }));

  return { quadrants };
}
