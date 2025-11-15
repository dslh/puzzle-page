// Category definition with emojis
interface Category {
  name: string;
  items: string[];
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

// Predefined categories with emoji items
const CATEGORIES: Category[] = [
  {
    name: 'Animals',
    items: ['🐶', '🐱', '🐭', '🐰', '🐼', '🐨', '🦊', '🐸', '🐷', '🐵', '🦁', '🐯'],
  },
  {
    name: 'Fruits',
    items: ['🍎', '🍌', '🍇', '🍊', '🍓', '🍉', '🍑', '🍒', '🍍', '🥝', '🍋', '🥥'],
  },
  {
    name: 'Vehicles',
    items: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚'],
  },
  {
    name: 'Sports',
    items: ['⚽', '🏀', '🎾', '⚾', '🏐', '🏈', '🎱', '🏓', '🏸', '🏒', '🥏', '🎳'],
  },
  {
    name: 'Flowers',
    items: ['🌸', '🌺', '🌻', '🌹', '🌷', '🌼', '💐', '🏵️', '🪷'],
  },
  {
    name: 'Tools',
    items: ['🔨', '🔧', '🪛', '✂️', '🪚', '⚒️', '🔩', '⛏️', '🪓', '🗜️'],
  },
  {
    name: 'Food',
    items: ['🍕', '🍔', '🌭', '🌮', '🍟', '🥪', '🥙', '🌯', '🥗', '🍝', '🍜', '🥘'],
  },
  {
    name: 'Ocean',
    items: ['🐠', '🐟', '🐡', '🦈', '🐙', '🦀', '🐚', '🦞', '🦑', '🐬', '🐳', '🦭'],
  },
  {
    name: 'Weather',
    items: ['☀️', '🌙', '⭐', '☁️', '⛅', '🌈', '❄️', '⚡', '🌧️', '🌩️', '🌪️'],
  },
  {
    name: 'Birds',
    items: ['🐦', '🦅', '🦆', '🦉', '🦚', '🦜', '🐧', '🦩', '🕊️', '🦢'],
  },
  {
    name: 'Insects',
    items: ['🐝', '🐛', '🦋', '🐞', '🐜', '🦗', '🕷️', '🪰', '🪲', '🦟'],
  },
  {
    name: 'Vegetables',
    items: ['🥕', '🥦', '🌽', '🥒', '🍅', '🥔', '🧅', '🧄', '🫑', '🥬'],
  },
  {
    name: 'Desserts',
    items: ['🍰', '🎂', '🧁', '🍪', '🍩', '🍦', '🍨', '🍧', '🧇', '🥧'],
  },
  {
    name: 'Drinks',
    items: ['🥤', '🧃', '🧋', '🥛', '☕', '🍵', '🧉', '🍼', '🥤'],
  },
  {
    name: 'Musical Instruments',
    items: ['🎸', '🎹', '🎺', '🎷', '🥁', '🎻', '🪕', '🪗'],
  },
  {
    name: 'Clothing',
    items: ['👕', '👔', '👗', '👠', '👞', '👟', '🧦', '🧤', '🎩', '👒', '🧢'],
  },
  {
    name: 'Buildings',
    items: ['🏠', '🏡', '🏢', '🏰', '🏛️', '⛪', '🕌', '🏗️', '🏭'],
  },
  {
    name: 'Farm Animals',
    items: ['🐄', '🐖', '🐓', '🐔', '🐏', '🐑', '🦆', '🐴', '🦃', '🐐'],
  },
  {
    name: 'Household Items',
    items: ['🪑', '🛋️', '🛏️', '🚪', '🪟', '🚿', '🛁', '🚽', '💡', '🕯️'],
  },
  {
    name: 'Trees & Plants',
    items: ['🌲', '🌳', '🌴', '🎄', '🌱', '🪴', '🌿', '🍀', '🎋'],
  },
  {
    name: 'Space',
    items: ['🌍', '🌎', '🌏', '🪐', '⭐', '✨', '💫', '🌟', '🚀', '🛸'],
  },
  {
    name: 'Wild Animals',
    items: ['🦒', '🦓', '🦏', '🦛', '🐘', '🦘', '🦙', '🦌', '🐪', '🦣'],
  },
  {
    name: 'Reptiles',
    items: ['🐊', '🐢', '🦎', '🐍', '🦕', '🦖', '🐲', '🐉'],
  },
  {
    name: 'Aircraft',
    items: ['✈️', '🛩️', '🚁', '🛫', '🛬', '🪂', '🎈'],
  },
  {
    name: 'Water Transport',
    items: ['⛵', '🚤', '🛥️', '⛴️', '🚢', '🛶', '⚓', '🏊'],
  },
  {
    name: 'Gems & Jewelry',
    items: ['💎', '💍', '👑', '📿', '💄', '🔮'],
  },
  {
    name: 'Kitchen',
    items: ['🍽️', '🥄', '🔪', '🥢', '🧂', '🥣', '🍴', '🥃', '🍷'],
  },
  {
    name: 'Books & Reading',
    items: ['📕', '📗', '📘', '📙', '📚', '📖', '📰', '🗞️', '📄'],
  },
  {
    name: 'Celebration',
    items: ['🎉', '🎊', '🎈', '🎁', '🎀', '🪅', '🎆', '🎇', '✨'],
  },
  {
    name: 'Music & Sound',
    items: ['🎵', '🎶', '🎼', '🎧', '📻', '📢', '📣', '🔔', '🔕'],
  },
];

/**
 * Generates a "Which Doesn't Belong?" puzzle
 * @param seed - Random seed for reproducible generation
 * @returns Puzzle with 5 items (4 from one category, 1 outlier)
 */
export function generateWhichDoesntBelong(seed: number): WhichDoesntBelongPuzzle {
  const random = new SeededRandom(seed);

  // Select two different categories
  const categoryIndices = random.shuffle([...Array(CATEGORIES.length).keys()]);
  const correctCategoryIndex = categoryIndices[0];
  const outlierCategoryIndex = categoryIndices[1];

  const correctCategory = CATEGORIES[correctCategoryIndex];
  const outlierCategory = CATEGORIES[outlierCategoryIndex];

  // Pick 4 items from the correct category
  const shuffledCorrectItems = random.shuffle([...correctCategory.items]);
  const correctItems = shuffledCorrectItems.slice(0, 4);

  // Pick 1 item from the outlier category
  const shuffledOutlierItems = random.shuffle([...outlierCategory.items]);
  const outlierItem = shuffledOutlierItems[0];

  // Combine and shuffle all 5 items
  const allItems = [...correctItems, outlierItem];
  const shuffledItems = random.shuffle(allItems);

  // Find the index of the outlier in the shuffled array
  const outlierIndex = shuffledItems.indexOf(outlierItem);

  return {
    items: shuffledItems,
    categories: {
      correct: correctCategory.name,
      outlier: outlierCategory.name,
    },
    outlierIndex,
  };
}
