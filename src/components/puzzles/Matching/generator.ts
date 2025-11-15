export interface MatchingPair {
  left: string;
  right: string;
}

export interface MatchingPuzzle {
  pairs: MatchingPair[];
  category: string;
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

const MATCHING_CATEGORIES = [
  {
    name: "Animals & Homes",
    pairs: [
      { left: "🐝", right: "🐝" },
      { left: "🐦", right: "🌳" },
      { left: "🐠", right: "💧" },
      { left: "🐶", right: "🏠" },
      { left: "🦫", right: "🪵" },
    ]
  },
  {
    name: "Animals & Food",
    pairs: [
      { left: "🐶", right: "🦴" },
      { left: "🐱", right: "🐟" },
      { left: "🐼", right: "🎋" },
      { left: "🐝", right: "🌸" },
      { left: "🐰", right: "🥕" },
    ]
  },
  {
    name: "Baby & Adult Animals",
    pairs: [
      { left: "🐣", right: "🐔" },
      { left: "🐛", right: "🦋" },
      { left: "🦆", right: "🦆" },
      { left: "🐸", right: "🐸" },
      { left: "🐙", right: "🐙" },
    ]
  },
  {
    name: "Objects & Uses",
    pairs: [
      { left: "✏️", right: "📝" },
      { left: "🔑", right: "🚪" },
      { left: "🌂", right: "☔" },
      { left: "🎨", right: "🖼️" },
      { left: "🔨", right: "🔩" },
    ]
  },
  {
    name: "Sports & Equipment",
    pairs: [
      { left: "⚽", right: "🥅" },
      { left: "🏀", right: "🏀" },
      { left: "🎾", right: "🎾" },
      { left: "🏈", right: "🏈" },
      { left: "🏐", right: "🏐" },
    ]
  },
  {
    name: "Weather & Seasons",
    pairs: [
      { left: "☀️", right: "🌞" },
      { left: "❄️", right: "⛄" },
      { left: "🌧️", right: "☔" },
      { left: "🍂", right: "🍁" },
      { left: "🌸", right: "🌷" },
    ]
  },
  {
    name: "Vehicles & Places",
    pairs: [
      { left: "✈️", right: "🛫" },
      { left: "🚗", right: "🛣️" },
      { left: "🚢", right: "🌊" },
      { left: "🚂", right: "🛤️" },
      { left: "🚁", right: "🏔️" },
    ]
  },
  {
    name: "Food & Origins",
    pairs: [
      { left: "🥛", right: "🐄" },
      { left: "🍯", right: "🐝" },
      { left: "🥚", right: "🐔" },
      { left: "🍎", right: "🌳" },
      { left: "🧀", right: "🐄" },
    ]
  },
];

export function generateMatchingPuzzle(seed: number, gridHeight: number = 4): MatchingPuzzle {
  const random = new SeededRandom(seed);

  // One pair per row
  const numPairs = gridHeight;

  // Select a random category
  const categoryIndex = random.nextInt(MATCHING_CATEGORIES.length);
  const category = MATCHING_CATEGORIES[categoryIndex];

  // Select random pairs from the category
  // If we need more pairs than available, cycle through the category
  const selectedPairs: MatchingPair[] = [];
  const availablePairs = [...category.pairs];

  for (let i = 0; i < numPairs; i++) {
    if (availablePairs.length === 0) {
      // Refill from category if we run out
      availablePairs.push(...category.pairs);
    }
    const index = random.nextInt(availablePairs.length);
    selectedPairs.push(availablePairs[index]);
    availablePairs.splice(index, 1);
  }

  return {
    pairs: selectedPairs,
    category: category.name,
  };
}
