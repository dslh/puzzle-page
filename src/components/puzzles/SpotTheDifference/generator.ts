import { SeededRandom } from '../../../utils/random';

export interface SpotTheDifferenceConfig {
  scene: SceneChoice;
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
export const SCENES = [
  { id: 'garden', label: 'Cottage garden' },
  { id: 'seaside', label: 'Seaside' },
  { id: 'camping', label: 'Woodland camp' },
] as const;
export type SceneTheme = typeof SCENES[number]['id'];
export type SceneChoice = SceneTheme | 'random';

interface FeatureSpec { x: number; y: number; radius: number; label: string }
// The ten slots occupy the same safe regions in each composition, but depict
// different objects. Each scene supplies its own answer descriptions and bounds.
export const SCENE_FEATURES: Record<SceneTheme, Record<Feature, FeatureSpec>> = {
  garden: FEATURES,
  seaside: {
    kite: { x: 244, y: 103, radius: 28, label: 'The way the seagull faces' },
    chimney: { x: 472, y: 103, radius: 27, label: 'The lighthouse flag' },
    window: { x: 474, y: 198, radius: 25, label: 'The lighthouse window' },
    door: { x: 401, y: 240, radius: 20, label: 'The lifebuoy' },
    fruit: { x: 100, y: 153, radius: 48, label: 'The sail’s pattern' },
    birdhouse: { x: 235, y: 198, radius: 26, label: 'The beach hut door' },
    flower: { x: 65, y: 299, radius: 25, label: 'The sandcastle flag' },
    cat: { x: 207, y: 297, radius: 19, label: 'The crab’s claw' },
    can: { x: 316, y: 308, radius: 23, label: 'The spade in the bucket' },
    duck: { x: 481, y: 323, radius: 31, label: 'The beach ball’s pattern' },
  },
  camping: {
    kite: { x: 244, y: 100, radius: 30, label: 'The moon’s shape' },
    chimney: { x: 461, y: 99, radius: 28, label: 'The tent’s flag' },
    window: { x: 474, y: 210, radius: 22, label: 'The tent’s window' },
    door: { x: 390, y: 229, radius: 25, label: 'The tent entrance' },
    fruit: { x: 100, y: 158, radius: 37, label: 'The owl’s eyes' },
    birdhouse: { x: 235, y: 184, radius: 30, label: 'The way the sign points' },
    flower: { x: 66, y: 310, radius: 29, label: 'The toadstool’s spots' },
    cat: { x: 178, y: 325, radius: 40, label: 'The way the hedgehog faces' },
    can: { x: 300, y: 302, radius: 22, label: 'The lantern handle' },
    duck: { x: 488, y: 321, radius: 26, label: 'The picnic mug’s handle' },
  },
};

export function generateScene(seed: number, count: SpotTheDifferenceConfig['differences'], choice: SceneChoice = 'garden') {
  const random = new SeededRandom(seed);
  const features = Object.keys(FEATURES) as Feature[];
  // A stable shuffled list means increasing the count keeps existing answers.
  const order = random.shuffle(features);
  const variants = Object.fromEntries(features.map(key => [key, random.nextInt(2)])) as Record<Feature, number>;
  // Independent streams keep decoration and theme stable when the count changes.
  const decoration = new SeededRandom(seed ^ 0x7363656e);
  const theme = choice === 'random' ? new SeededRandom(seed ^ 0x7468656d).pick(SCENES).id : choice;
  return {
    theme,
    features: SCENE_FEATURES[theme],
    style: decoration.nextInt(3),
    palette: decoration.nextInt(4),
    detail: decoration.nextInt(3),
    decoration: decoration.nextInt(3),
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

export type GeneratedScene = ReturnType<typeof generateScene>;
