import { SeededRandom } from '../../../utils/random';

export interface SpotTheDifferenceConfig {
  differences: 3 | 5 | 7;
  outline: boolean;
  answers: boolean;
}

// Each change belongs to a separate, unobscured part of the illustration.
// These coordinates are also the answer key; no image comparison is needed.
export const FEATURES = {
  kite: { x: 244, y: 112, radius: 30, label: 'The kite’s tail' },
  chimney: { x: 472, y: 106, radius: 25, label: 'The chimney' },
  window: { x: 474, y: 203, radius: 29, label: 'The window’s shape' },
  door: { x: 390, y: 217, radius: 22, label: 'The little window in the door' },
  fruit: { x: 100, y: 146, radius: 48, label: 'The apples on the tree' },
  birdhouse: { x: 235, y: 182, radius: 23, label: 'The birdhouse entrance' },
  flower: { x: 66, y: 302, radius: 28, label: 'The flower’s shape' },
  cat: { x: 213, y: 331, radius: 23, label: 'The cat’s tail' },
  can: { x: 324, y: 300, radius: 18, label: 'The watering can’s rose' },
  duck: { x: 477, y: 324, radius: 31, label: 'The way the duck faces' },
} as const;

export type Feature = keyof typeof FEATURES;

export function generateScene(seed: number, count: SpotTheDifferenceConfig['differences']) {
  const random = new SeededRandom(seed);
  const features = Object.keys(FEATURES) as Feature[];
  // A stable shuffled list means increasing the count keeps existing answers.
  const order = random.shuffle(features);
  const variants = Object.fromEntries(features.map(key => [key, random.nextInt(2)])) as Record<Feature, number>;
  return {
    changes: order.slice(0, count),
    variants,
    mirrored: random.nextInt(2) === 1,
    roof: random.nextInt(4),
    tree: random.nextInt(2),
    fence: random.nextInt(2),
    flowers: random.nextIntRange(2, 4),
    clouds: random.nextIntRange(1, 3),
    steppingStones: random.nextIntRange(3, 5),
  };
}

export type GardenScene = ReturnType<typeof generateScene>;
