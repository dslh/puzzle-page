import type { ArtId } from './art';

/** One picture in a cycle: an emoji, or one of our own drawings. */
export interface Stage {
  name: string;
  emoji?: string;
  art?: ArtId;
}

export interface Cycle {
  label: string;
  /** In order, starting where children are taught to start: egg, seed, baby. */
  stages: Stage[];
}

export const CYCLES = {
  chicken: {
    label: 'Chicken',
    stages: [
      { name: 'egg', emoji: '🥚' },
      { name: 'chick hatching', emoji: '🐣' },
      { name: 'chick', emoji: '🐥' },
      { name: 'hen', emoji: '🐔' },
    ],
  },
  frog: {
    label: 'Frog',
    stages: [
      { name: 'frogspawn', art: 'frogspawn' },
      { name: 'tadpole', art: 'tadpole' },
      { name: 'tadpole with legs', art: 'tadpoleLegs' },
      { name: 'froglet', art: 'froglet' },
      { name: 'frog', art: 'frog' },
    ],
  },
  butterfly: {
    label: 'Butterfly',
    stages: [
      { name: 'eggs', art: 'butterflyEggs' },
      { name: 'caterpillar', emoji: '🐛' },
      { name: 'chrysalis', art: 'chrysalis' },
      { name: 'butterfly', emoji: '🦋' },
    ],
  },
  ladybird: {
    label: 'Ladybird',
    stages: [
      { name: 'eggs', art: 'ladybirdEggs' },
      { name: 'larva', art: 'ladybirdLarva' },
      { name: 'pupa', art: 'ladybirdPupa' },
      { name: 'ladybird', emoji: '🐞' },
    ],
  },
  sunflower: {
    label: 'Sunflower',
    stages: [
      { name: 'seeds', art: 'sunflowerSeeds' },
      { name: 'seedling', emoji: '🌱' },
      { name: 'young plant', art: 'sunflowerBud' },
      { name: 'sunflower', emoji: '🌻' },
    ],
  },
  apple: {
    label: 'Apple tree',
    stages: [
      { name: 'seedling', emoji: '🌱' },
      { name: 'tree', emoji: '🌳' },
      { name: 'blossom', emoji: '🌸' },
      { name: 'apple', emoji: '🍎' },
    ],
  },
  people: {
    label: 'People',
    stages: [
      // Noto's child, person and older person are too alike to tell apart.
      // Pigtails, long hair and a grey bun are not.
      { name: 'baby', emoji: '👶' },
      { name: 'girl', emoji: '👧' },
      { name: 'woman', emoji: '👩' },
      { name: 'grandma', emoji: '👵' },
    ],
  },
} satisfies Record<string, Cycle>;

export type CycleId = keyof typeof CYCLES;

export const CYCLE_IDS = Object.keys(CYCLES) as CycleId[];
