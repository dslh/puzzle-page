// Category definition with emojis
export interface Category {
  name: string;
  items: string[];
  /**
   * Broader groups this one belongs to. Two categories sharing a family are
   * never paired in a row: a cow among dogs and cats is "not a pet", but it
   * is still an animal, so the row would have no single right answer.
   */
  families: string[];
}

// Puzzle data structure
export interface WhichDoesntBelongPuzzle {
  items: string[];
  categories: { correct: string; outlier: string };
  outlierIndex: number;
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

  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

// Predefined categories with emoji items. No emoji appears in two
// categories, and each has at least four, the most a row takes from one.
export const CATEGORIES: Category[] = [
  {
    name: 'Animals',
    items: ['🐶', '🐱', '🐭', '🐰', '🐼', '🐨', '🦊', '🐸', '🐷', '🐵', '🦁', '🐯'],
    families: ['animal'],
  },
  {
    name: 'Fruits',
    items: ['🍎', '🍌', '🍇', '🍊', '🍓', '🍉', '🍑', '🍒', '🍍', '🥝', '🍋', '🥥'],
    families: ['food'],
  },
  {
    name: 'Vehicles',
    items: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚'],
    families: ['transport'],
  },
  {
    name: 'Sports',
    items: ['⚽', '🏀', '🎾', '⚾', '🏐', '🏈', '🎱', '🏓', '🏸', '🏒', '🥏', '🎳'],
    families: ['sport'],
  },
  {
    name: 'Flowers',
    items: ['🌸', '🌺', '🌻', '🌹', '🌷', '🌼', '💐', '🏵️', '🪷'],
    families: ['plant'],
  },
  {
    name: 'Tools',
    items: ['🔨', '🔧', '🪛', '✂️', '🪚', '⚒️', '🔩', '⛏️', '🪓', '🗜️'],
    families: ['tool'],
  },
  {
    name: 'Food',
    items: ['🍕', '🍔', '🌭', '🌮', '🍟', '🥪', '🥙', '🌯', '🥗', '🍝', '🍜', '🥘'],
    families: ['food'],
  },
  {
    name: 'Ocean',
    items: ['🐠', '🐟', '🐡', '🦈', '🐙', '🦀', '🐚', '🦞', '🦑', '🐬', '🐳', '🦭'],
    families: ['animal', 'water'],
  },
  {
    name: 'Weather',
    items: ['☀️', '☁️', '⛅', '🌈', '❄️', '⚡', '🌧️', '🌩️', '🌪️'],
    families: ['sky'],
  },
  {
    name: 'Birds',
    items: ['🐦', '🦅', '🦆', '🦉', '🦚', '🦜', '🐧', '🦩', '🕊️', '🦢'],
    families: ['animal', 'flying'],
  },
  {
    name: 'Insects',
    items: ['🐝', '🐛', '🦋', '🐞', '🐜', '🦗', '🕷️', '🪰', '🪲', '🦟'],
    families: ['animal'],
  },
  {
    name: 'Vegetables',
    items: ['🥕', '🥦', '🌽', '🥒', '🍅', '🥔', '🧅', '🧄', '🫑', '🥬'],
    families: ['food'],
  },
  {
    name: 'Desserts',
    items: ['🍰', '🎂', '🧁', '🍪', '🍩', '🍦', '🍨', '🍧', '🧇', '🥧'],
    families: ['food', 'party'],
  },
  {
    name: 'Drinks',
    items: ['🥤', '🧃', '🧋', '🥛', '☕', '🍵', '🧉', '🍼'],
    families: ['food'],
  },
  {
    name: 'Musical Instruments',
    items: ['🎸', '🎹', '🎺', '🎷', '🥁', '🎻', '🪕', '🪗'],
    families: ['music'],
  },
  {
    name: 'Clothing',
    items: ['👕', '👔', '👗', '👠', '👞', '👟', '🧦', '🧤', '🎩', '👒', '🧢'],
    families: ['wear'],
  },
  {
    name: 'Buildings',
    items: ['🏠', '🏡', '🏢', '🏰', '🏛️', '⛪', '🕌', '🏗️', '🏭'],
    families: ['home'],
  },
  {
    name: 'Farm Animals',
    items: ['🐄', '🐖', '🐓', '🐔', '🐏', '🐑', '🐴', '🦃', '🐐'],
    families: ['animal'],
  },
  {
    name: 'Household Items',
    items: ['🪑', '🛋️', '🛏️', '🚪', '🪟', '🚿', '🛁', '🚽', '💡', '🕯️'],
    families: ['home'],
  },
  {
    name: 'Trees & Plants',
    items: ['🌲', '🌳', '🌴', '🌱', '🪴', '🌿', '🍀', '🎋'],
    families: ['plant'],
  },
  {
    name: 'Space',
    items: ['🌍', '🌎', '🌏', '🪐', '🌙', '⭐', '✨', '💫', '🌟', '🚀', '🛸'],
    families: ['sky', 'flying'],
  },
  {
    name: 'Wild Animals',
    items: ['🦒', '🦓', '🦏', '🦛', '🐘', '🦘', '🦙', '🦌', '🐪', '🦣'],
    families: ['animal'],
  },
  {
    name: 'Reptiles',
    items: ['🐊', '🐢', '🦎', '🐍', '🦕', '🦖', '🐲', '🐉'],
    families: ['animal'],
  },
  {
    name: 'Aircraft',
    items: ['✈️', '🛩️', '🚁', '🛫', '🛬', '🪂'],
    families: ['transport', 'flying', 'sky'],
  },
  {
    name: 'Water Transport',
    items: ['⛵', '🚤', '🛥️', '⛴️', '🚢', '🛶'],
    families: ['transport', 'water'],
  },
  {
    name: 'Jewellery',
    items: ['💎', '💍', '👑', '📿'],
    families: ['wear'],
  },
  {
    name: 'Kitchen',
    items: ['🍽️', '🥄', '🔪', '🥢', '🧂', '🥣', '🍴'],
    families: ['home', 'tool'],
  },
  {
    name: 'Books & Reading',
    items: ['📕', '📗', '📘', '📙', '📚', '📖', '📰', '🗞️', '📄'],
    families: ['books'],
  },
  {
    name: 'Celebration',
    items: ['🎉', '🎊', '🎈', '🎁', '🎀', '🪅', '🎆', '🎇'],
    families: ['party'],
  },
  {
    name: 'Music & Sound',
    items: ['🎵', '🎶', '🎼', '🎧', '📻', '📢', '📣', '🔔', '🔕'],
    families: ['music'],
  },
];

const ITEMS_PER_GROUP = 4;

export function clash(a: Category, b: Category): boolean {
  return a.families.some(family => b.families.includes(family));
}

function generateRow(
  random: SeededRandom,
  correctCategory: Category
): WhichDoesntBelongPuzzle {
  // Any category from an unrelated family can supply the odd one out
  const outlierCategory = random.shuffle(
    CATEGORIES.filter(category => !clash(category, correctCategory))
  )[0];

  const correctItems = random.shuffle([...correctCategory.items]).slice(0, ITEMS_PER_GROUP);
  const outlierItem = random.shuffle([...outlierCategory.items])[0];

  const items = random.shuffle([...correctItems, outlierItem]);

  return {
    items,
    categories: {
      correct: correctCategory.name,
      outlier: outlierCategory.name,
    },
    outlierIndex: items.indexOf(outlierItem),
  };
}

/**
 * A sheet of "Which Doesn't Belong?" rows, all drawn from one random sequence
 * so that neighbouring seeds give unrelated sheets. Each row's group of four
 * is used once per sheet until every category has had a turn.
 * @returns One puzzle per row: 4 items from one category, 1 outlier
 */
export function generateWhichDoesntBelong(
  seed: number,
  rowCount: number
): WhichDoesntBelongPuzzle[] {
  const random = new SeededRandom(seed);

  const rows: WhichDoesntBelongPuzzle[] = [];
  let order: Category[] = [];
  for (let i = 0; i < rowCount; i++) {
    if (order.length === 0) order = random.shuffle(CATEGORIES);
    rows.push(generateRow(random, order.pop() as Category));
  }
  return rows;
}
