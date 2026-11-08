import type { ScenePart } from './layout';
import { SeededRandom } from '../../../utils/random';

export interface SpotTheDifferenceConfig {
  scene: SceneChoice;
  differences: 3 | 5 | 7;
  outline: boolean;
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
  cat: { x: 209, y: 327, radius: 29, label: 'The cat’s tail' },
  can: { x: 324, y: 300, radius: 18, label: 'The watering can’s rose' },
  duck: { x: 477, y: 324, radius: 31, label: 'The way the duck faces' },
} as const;

export type Feature = keyof typeof FEATURES;
export const SCENES = [
  { id: 'garden', label: 'Cottage garden' },
  { id: 'seaside', label: 'Seaside' },
  { id: 'camping', label: 'Woodland camp' },
  { id: 'farmyard', label: 'Farmyard' },
  { id: 'playground', label: 'Playground' },
] as const;
export type SceneTheme = typeof SCENES[number]['id'];
export type SceneChoice = SceneTheme | 'random';

interface FeatureSpec { x: number; y: number; radius: number; label: string }
// The ten slots occupy the same safe regions in each composition, but depict
// different objects. Each scene supplies its own answer descriptions and bounds.
export const SCENE_FEATURES: Record<SceneTheme, Record<Feature, FeatureSpec>> = {
  garden: FEATURES,
  playground: {
    kite: { x: 240, y: 114, radius: 18, label: 'The bow on the balloon string' },
    chimney: { x: 437, y: 66, radius: 24, label: 'The play tower’s flag' },
    window: { x: 422, y: 156, radius: 19, label: 'The play tower’s window' },
    door: { x: 375, y: 211, radius: 18, label: 'The ladder’s steps' },
    fruit: { x: 102, y: 214, radius: 30, label: 'The swing seat’s shape' },
    birdhouse: { x: 235, y: 225, radius: 36, label: 'The climbing frame’s crossbar' },
    flower: { x: 66, y: 337, radius: 17, label: 'The shape on the sand bucket' },
    cat: { x: 176, y: 331, radius: 19, label: 'The teddy’s bow tie' },
    can: { x: 319, y: 296, radius: 13, label: 'The scooter’s bell' },
    duck: { x: 503, y: 291, radius: 19, label: 'The sandcastle’s flag' },
  },
  farmyard: {
    kite: { x: 244, y: 96, radius: 36, label: 'The sun’s rays' },
    chimney: { x: 473, y: 93, radius: 28, label: 'The way the weather vane points' },
    window: { x: 476, y: 203, radius: 29, label: 'The barn window’s shape' },
    door: { x: 410, y: 230, radius: 33, label: 'The cross on the barn door' },
    fruit: { x: 100, y: 148, radius: 48, label: 'The apples on the tree' },
    birdhouse: { x: 235, y: 163, radius: 26, label: 'The scarecrow’s hat' },
    flower: { x: 65, y: 300, radius: 25, label: 'The vegetables in the basket' },
    cat: { x: 214, y: 328, radius: 18, label: 'The sheep’s tail' },
    can: { x: 290, y: 296, radius: 23, label: 'The spade in the wheelbarrow' },
    duck: { x: 447, y: 342, radius: 23, label: 'The tractor wheel’s spokes' },
  },
  seaside: {
    kite: { x: 244, y: 103, radius: 34, label: 'The way the seagull faces' },
    chimney: { x: 486, y: 87, radius: 24, label: 'The lighthouse flag' },
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
    chimney: { x: 456, y: 91, radius: 28, label: 'The tent’s flag' },
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
  const composition = new SeededRandom(seed ^ 0x6c61796f);
  const backgroundFlipped = composition.nextInt(2) === 1;
  const foregroundFlipped = composition.nextInt(2) === 1;
  // Three generous ground slots, independent of the large pond/picnic slot.
  // Keep connected structures together: owl + tree, windows + building, etc.
  const slots = composition.shuffle([70, 183, 296]);
  const placements = Object.fromEntries((['flower', 'cat', 'can'] as const).map((part, i) => [part, {
    x: slots[i] + composition.nextFloat(-5, 5),
    y: composition.nextFloat(-5, 3),
    scale: composition.nextFloat(.84, 1),
    flipped: composition.nextInt(2) === 1,
  }])) as Partial<Record<ScenePart, { x: number; y: number; scale: number; flipped: boolean }>>;
  // Vary the landmarks within reserved regions, keeping their feet grounded.
  for (const [part, x] of [['tree', 100], ['cottage', 435], ['birdhouse', 235], ['kite', 244]] as const) {
    const scale = composition.nextFloat(.9, 1);
    const ground = theme === 'seaside' ? 270 : theme === 'camping' ? 249 : 252;
    placements[part] = {
      x: x + composition.nextFloat(-6, 6),
      y: part === 'kite' ? -5 : part === 'birdhouse' ? (ground - 149) * (1 - scale) : 0,
      scale,
      flipped: false,
    };
  }
  // The hull and its wake must stay on the water side of the tideline.
  if (theme === 'seaside') placements.tree!.y = -18;
  const pet = composition.pick(['cat', 'dog'] as const);
  const livestock = new SeededRandom(seed ^ 0x6661726d).pick(['sheep', 'pig'] as const);
  const playground = new SeededRandom(seed ^ 0x706c6179);
  const playToy = playground.pick(['teddy', 'bunny'] as const);
  const playRide = playground.pick(['scooter', 'tricycle'] as const);
  const specs = SCENE_FEATURES[theme];
  return {
    theme,
    features: {
      ...specs,
      can: { ...specs.can, label: theme === 'playground' ? `The ${playRide}’s bell` : specs.can.label },
      cat: {
        ...specs.cat,
        label: theme === 'garden' ? `The ${pet}’s tail`
          : theme === 'farmyard' ? `The ${livestock}’s tail`
          : theme === 'playground' ? `The ${playToy}’s bow tie` : specs.cat.label,
      },
    },
    backgroundFlipped,
    foregroundFlipped,
    placements,
    pet,
    livestock,
    playToy,
    playRide,
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
