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
  door: { x: 390, y: 217, radius: 22, label: 'The shape on the door' },
  fruit: { x: 100, y: 146, radius: 48, label: 'The apples on the tree' },
  birdhouse: { x: 235, y: 182, radius: 23, label: 'The birdhouse entrance' },
  flower: { x: 66, y: 302, radius: 28, label: 'The flower' },
  cat: { x: 209, y: 327, radius: 29, label: 'The cat’s tail' },
  can: { x: 328, y: 303, radius: 24, label: 'The end of the watering can’s spout' },
  duck: { x: 477, y: 324, radius: 31, label: 'The duck' },
} as const;

export type Feature = keyof typeof FEATURES;
export const SCENES = [
  { id: 'garden', label: 'Cottage garden' },
  { id: 'seaside', label: 'Seaside' },
  { id: 'camping', label: 'Woodland camp' },
  { id: 'farmyard', label: 'Farmyard' },
  { id: 'playground', label: 'Playground' },
  { id: 'castle', label: 'Castle' },
] as const;
export type SceneTheme = typeof SCENES[number]['id'];
export type SceneChoice = SceneTheme | 'random';

interface FeatureSpec { x: number; y: number; radius: number; label: string }
// The ten slots occupy the same safe regions in each composition, but depict
// different objects. Each scene supplies its own answer descriptions and bounds.
export const SCENE_FEATURES: Record<SceneTheme, Record<Feature, FeatureSpec>> = {
  garden: FEATURES,
  castle: {
    kite: { x: 314, y: 58, radius: 22, label: 'What the dragon is breathing' },
    chimney: { x: 505, y: 40, radius: 26, label: 'The flag on the tower' },
    window: { x: 486, y: 158, radius: 18, label: 'The tower window’s shape' },
    door: { x: 421, y: 234, radius: 28, label: 'The castle gate' },
    fruit: { x: 104, y: 127, radius: 24, label: 'What is in the nest' },
    birdhouse: { x: 235, y: 189, radius: 26, label: 'The pattern on the shield' },
    flower: { x: 68, y: 292, radius: 25, label: 'The plume on the helmet' },
    cat: { x: 176, y: 303, radius: 15, label: 'What is on the frog’s head' },
    can: { x: 290, y: 316, radius: 27, label: 'The treasure chest' },
    duck: { x: 446, y: 333, radius: 25, label: 'The baby swans' },
  },
  playground: {
    kite: { x: 236, y: 114, radius: 20, label: 'The balloon string' },
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
    chimney: { x: 473, y: 90, radius: 30, label: 'The weather vane' },
    window: { x: 476, y: 203, radius: 29, label: 'The barn window’s shape' },
    door: { x: 410, y: 230, radius: 33, label: 'The pattern on the barn door' },
    fruit: { x: 100, y: 148, radius: 48, label: 'The apples on the tree' },
    birdhouse: { x: 235, y: 163, radius: 26, label: 'The scarecrow’s hat' },
    flower: { x: 65, y: 300, radius: 25, label: 'The vegetables in the basket' },
    cat: { x: 214, y: 328, radius: 18, label: 'The sheep’s tail' },
    can: { x: 290, y: 296, radius: 23, label: 'The tool in the wheelbarrow' },
    duck: { x: 447, y: 342, radius: 23, label: 'The tractor wheel’s spokes' },
  },
  seaside: {
    kite: { x: 244, y: 103, radius: 34, label: 'The seagull' },
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
    cat: { x: 178, y: 325, radius: 40, label: 'The hedgehog' },
    can: { x: 300, y: 302, radius: 22, label: 'The lantern handle' },
    duck: { x: 488, y: 314, radius: 30, label: 'The picnic mug' },
  },
};

// How many drawn versions each changeable part has (two if not listed). The
// original picture shows one; a change swaps it for any other. More versions
// mean both the pictures and the kinds of change vary from roll to roll.
export const VERSIONS: Record<SceneTheme, Partial<Record<Feature, number>>> = {
  garden: { kite: 3, chimney: 3, window: 4, door: 4, fruit: 3, birdhouse: 4, flower: 3, cat: 3, can: 3, duck: 3 },
  seaside: { kite: 3, chimney: 3, window: 3, fruit: 3, birdhouse: 3, flower: 3, can: 3, duck: 3 },
  camping: { kite: 3, chimney: 3, window: 3, door: 3, fruit: 3, flower: 3, cat: 3, can: 3, duck: 3 },
  farmyard: { kite: 3, chimney: 3, window: 4, door: 3, fruit: 3, birdhouse: 3, flower: 3, cat: 3, can: 3, duck: 3 },
  playground: { kite: 3, chimney: 3, window: 3, fruit: 3, flower: 3, duck: 3 },
  castle: { kite: 3, chimney: 3, window: 3, door: 3, fruit: 3, birdhouse: 4, flower: 3, cat: 3, can: 3, duck: 3 },
};

interface Prop extends Partial<FeatureSpec> { id: string; versions?: number }
// Swappable objects: a slot holds any one of its objects, each with a change
// of its own. The first is the slot's original object, described above; the
// others give their own answer, bounds and number of versions (two if unset).
export const PROPS: Record<SceneTheme, Partial<Record<Feature, readonly Prop[]>>> = {
  garden: {
    kite: [{ id: 'kite' }, { id: 'balloon', x: 244, y: 60, radius: 32, label: 'The pattern on the balloon', versions: 3 }],
    flower: [
      { id: 'bed' },
      { id: 'gnome', x: 68, y: 292, radius: 18, label: 'The gnome’s hat', versions: 3 },
      { id: 'snail', x: 72, y: 323, radius: 26, label: 'The snail’s shell', versions: 3 },
      { id: 'beehive', x: 91, y: 295, radius: 20, label: 'The bees by the hive', versions: 3 },
    ],
    cat: [
      { id: 'cat' },
      { id: 'dog', label: 'The dog’s tail', versions: 3 },
      { id: 'rabbit', x: 182, y: 307, radius: 28, label: 'The rabbit’s ears', versions: 3 },
      { id: 'tortoise', x: 212, y: 335, radius: 18, label: 'The tortoise’s head', versions: 3 },
    ],
    can: [
      { id: 'can' },
      { id: 'birdbath', x: 290, y: 302, radius: 30, label: 'The birds on the bird bath', versions: 3 },
      { id: 'wellies', x: 293, y: 324, radius: 38, label: 'The pattern on the boots', versions: 3 },
    ],
  },
  seaside: {
    kite: [{ id: 'gull' }, { id: 'balloon', x: 244, y: 60, radius: 32, label: 'The pattern on the balloon', versions: 3 }],
    flower: [
      { id: 'sandcastle' },
      { id: 'rockpool', x: 70, y: 345, radius: 22, label: 'What is in the rock pool', versions: 3 },
      { id: 'icecream', x: 66, y: 309, radius: 20, label: 'The ice cream on the sign', versions: 3 },
    ],
    cat: [
      { id: 'crab' },
      { id: 'starfish', x: 176, y: 321, radius: 15, label: 'The starfish’s face', versions: 3 },
      { id: 'seal', x: 217, y: 305, radius: 18, label: 'What is on the seal’s nose', versions: 3 },
    ],
    can: [{ id: 'bucket' }, { id: 'deckchair', x: 290, y: 306, radius: 30, label: 'The pattern on the deckchair', versions: 3 }],
  },
  camping: {
    flower: [{ id: 'toadstools' }, { id: 'campfire', x: 68, y: 315, radius: 26, label: 'The campfire', versions: 3 }],
    cat: [
      { id: 'hedgehog' },
      { id: 'fox', x: 146, y: 319, radius: 32, label: 'The fox’s tail', versions: 3 },
      { id: 'squirrel', x: 195, y: 316, radius: 14, label: 'What the squirrel is holding', versions: 3 },
    ],
    can: [
      { id: 'lantern' },
      { id: 'rucksack', x: 290, y: 328, radius: 20, label: 'The front of the rucksack', versions: 3 },
      { id: 'logpile', x: 290, y: 320, radius: 34, label: 'The pile of logs' },
    ],
  },
  farmyard: {
    flower: [
      { id: 'basket' },
      { id: 'hen', x: 95, y: 341, radius: 20, label: 'The chicks', versions: 3 },
      { id: 'haybale', x: 68, y: 303, radius: 26, label: 'The cat on the hay bale', versions: 3 },
    ],
    cat: [
      { id: 'sheep' },
      { id: 'pig', label: 'The pig’s tail', versions: 3 },
      { id: 'goat', x: 194, y: 291, radius: 16, label: 'The goat’s horns', versions: 3 },
    ],
    can: [
      { id: 'wheelbarrow' },
      { id: 'churns', x: 302, y: 294, radius: 14, label: 'The lid on the milk churn' },
      { id: 'pumpkin', x: 312, y: 302, radius: 18, label: 'The pumpkin’s stalk', versions: 3 },
    ],
  },
  playground: {
    flower: [{ id: 'bucket' }, { id: 'springhorse', x: 76, y: 305, radius: 14, label: 'The spring horse’s mane', versions: 3 }],
    cat: [
      { id: 'teddy' },
      { id: 'bunny', label: 'The bunny’s bow tie' },
      { id: 'dinosaur', x: 175, y: 313, radius: 26, label: 'The plates on the dinosaur’s back', versions: 3 },
    ],
    can: [
      { id: 'scooter' },
      { id: 'tricycle', label: 'The tricycle’s bell' },
      { id: 'pram', x: 273, y: 299, radius: 24, label: 'The pram’s hood' },
    ],
  },
  castle: {
    flower: [{ id: 'helmet' }, { id: 'well', x: 66, y: 309, radius: 16, label: 'The well’s bucket' }],
    cat: [{ id: 'frog' }, { id: 'goose', x: 204, y: 344, radius: 18, label: 'The golden eggs', versions: 3 }],
    can: [{ id: 'chest' }, { id: 'crown', x: 290, y: 320, radius: 22, label: 'The points on the crown' }],
  },
};

/** Where a slot's change is, what it is, and how many versions it has. */
export function featureSpec(theme: SceneTheme, key: Feature, id?: string) {
  const pool = PROPS[theme][key];
  const prop = pool?.find(p => p.id === id);
  return { ...SCENE_FEATURES[theme][key], versions: prop && prop !== pool![0] ? 2 : VERSIONS[theme][key] ?? 2, ...prop };
}

export function generateScene(seed: number, count: SpotTheDifferenceConfig['differences'], choice: SceneChoice = 'garden') {
  const random = new SeededRandom(seed);
  const features = Object.keys(FEATURES) as Feature[];
  // Independent streams keep decoration and theme stable when the count changes.
  // Scenes after the first five come from a draw of their own, so a saved
  // Surprise me page keeps its scene unless it becomes one of the new ones.
  const themes = new SeededRandom(seed ^ 0x7468656d);
  const first = themes.pick(SCENES.slice(0, 5)).id;
  const added = SCENES.slice(5);
  const theme = choice !== 'random' ? choice : themes.nextInt(SCENES.length) < added.length ? themes.pick(added).id : first;
  // A stable shuffled list means increasing the count keeps existing answers.
  const order = random.shuffle(features);
  // Which object stands in each slot that has a choice.
  const chooser = new SeededRandom(seed ^ 0x70726f70);
  const chosen = Object.fromEntries(features.flatMap(key => {
    const pool = PROPS[theme][key];
    return pool ? [[key, chooser.pick(pool)]] : [];
  })) as Partial<Record<Feature, Prop>>;
  const props = Object.fromEntries(Object.entries(chosen).map(([key, prop]) => [key, prop.id])) as Partial<Record<Feature, string>>;
  const featureSpecs = Object.fromEntries(features.map(key => [key, featureSpec(theme, key, props[key])])) as Record<Feature, FeatureSpec & { versions: number }>;
  const variants = Object.fromEntries(features.map(key => [key, random.nextInt(featureSpecs[key].versions)])) as Record<Feature, number>;
  // The version each part becomes when it is one of the changes.
  const versions = new SeededRandom(seed ^ 0x76657273);
  const swaps = Object.fromEntries(features.map(key => {
    const count = featureSpecs[key].versions;
    return [key, (variants[key] + 1 + versions.nextInt(count - 1)) % count];
  })) as Record<Feature, number>;
  const decoration = new SeededRandom(seed ^ 0x7363656e);
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
  }])) as Partial<Record<ScenePart, { x: number; y: number; scale: number; flipped: boolean; lift?: number }>>;
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
  // On a tall panel the middle ground object stands further back, so the
  // spare height fills the ground rather than leaving one row along the bottom.
  placements[(['flower', 'cat', 'can'] as const)[slots.indexOf(183)]]!.lift = .3;
  return {
    theme,
    features: featureSpecs,
    props,
    backgroundFlipped,
    foregroundFlipped,
    placements,
    style: decoration.nextInt(3),
    palette: decoration.nextInt(4),
    detail: decoration.nextInt(3),
    decoration: decoration.nextInt(3),
    changes: order.slice(0, count),
    variants,
    swaps,
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

/** Which version of a part to draw: its own, or its swap where it changes. */
export function version(scene: GeneratedScene, key: Feature, second: boolean) {
  return second && scene.changes.includes(key) ? scene.swaps[key] : scene.variants[key];
}
