import { SeededRandom } from '../../../utils/random';

export interface ScrambledQuadrant {
  originalPosition: number;  // 0-3 (which quadrant from original image)
  rotation: number;          // 0, 90, 180, 270
}

export interface ScrambledPuzzle {
  quadrants: ScrambledQuadrant[];
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
