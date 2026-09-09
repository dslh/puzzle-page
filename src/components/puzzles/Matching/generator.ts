import { WORD_LIST } from '../WordSearch/wordList';

export type MatchingMode = 'silhouette' | 'word';

export interface MatchingPair {
  /** Left column: an emoji in silhouette mode, the word itself in word mode. */
  left: string;
  /** Right column: always an emoji. */
  right: string;
}

export interface MatchingPuzzle {
  pairs: MatchingPair[];
  category: string;
  mode: MatchingMode;
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
    name: "Animals",
    emoji: ["🐶", "🐱", "🐭", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧", "🐦", "🦆", "🦉", "🦇", "🐺", "🐗", "🐴", "🦄", "🐝", "🐛", "🦋", "🐌", "🐞", "🐢", "🐍", "🦎", "🐙", "🦑", "🦀", "🐡", "🐠", "🐟", "🐬", "🐳", "🦈", "🐊", "🐘", "🦏", "🦛", "🐪", "🐫", "🦒", "🦘"],
  },
  {
    name: "Food",
    emoji: ["🍎", "🍕", "🍔", "🍰", "🍩", "🍪", "🍫", "🍬", "🍭", "🧁", "🍌", "🍉", "🍇", "🍓", "🍒", "🍑", "🍍", "🥝", "🥑", "🍆", "🌽", "🥕", "🥐", "🥖", "🥨", "🧀", "🥚", "🍳", "🥓", "🥞", "🧇", "🍗", "🍖", "🌭", "🥪", "🌮", "🌯", "🍝", "🍜", "🍲", "🍣", "🍤", "🦞", "🍦", "🍧", "🍨"],
  },
  {
    name: "Transportation",
    emoji: ["🚗", "✈️", "🚂", "🚢", "🚁", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐", "🛻", "🚚", "🚛", "🚜", "🛵", "🏍️", "🛺", "🚲", "🛴", "🛹", "🚃", "🚋", "🚝", "🚄", "🚅", "🚈", "🚇", "🚆", "🚀", "🛸", "🚤", "🛥️", "⛵", "🛶"],
  },
  {
    name: "Nature",
    emoji: ["🌲", "🌻", "🌙", "⭐", "🍄", "🌳", "🌴", "🌵", "🌾", "🌿", "☘️", "🍀", "🍁", "🍂", "🍃", "🌺", "🌸", "🏵️", "🌹", "🥀", "🌷", "🌼", "🌱", "🪴", "🌊", "💧", "💦", "🌈", "☀️", "🌞", "🌝", "🌛", "🌜", "🌚", "🌟", "✨", "⚡", "☄️", "💫", "🔥", "🌪️", "🌀", "☁️", "🌧️", "⛈️", "🌩️", "🌨️", "❄️", "☃️", "⛄"],
  },
  {
    name: "Music & Arts",
    emoji: ["🎸", "🎨", "🎭", "🎪", "🎬", "🎤", "🎧", "🎼", "🎹", "🥁", "🎺", "🎷", "🎻", "🪕", "🎙️", "🎞️", "🎥", "📷", "📸", "🖼️", "🖌️", "🖍️", "✏️"],
  },
  {
    name: "Celebrations",
    emoji: ["🎂", "🎉", "🎁", "🎈", "🎆", "🎇", "🎀", "🎊", "🎃", "🎄", "🎋", "🎍", "🎑", "🎏", "🎐", "🪅", "🧨", "🪔", "🕯️", "💝", "💐", "🥂", "🍾", "🥳", "🎓", "🎟️", "🎫"],
  },
  {
    name: "Objects",
    emoji: ["💎", "👑", "🔑", "⚓", "🎩", "👒", "⛑️", "💍", "💄", "👜", "🎒", "👞", "👟", "🥾", "👠", "👡", "👢", "🔧", "🔨", "⚒️", "🛠️", "⛏️", "🪓", "🪚", "🔩", "⚙️", "🧰", "🪛", "🏹", "🛡️", "🔪", "🗡️", "⚔️", "🪄", "🔮", "🎯", "🪁", "🪀", "🧲", "🧪", "🧫", "🔬", "🔭", "📡", "💉", "🩺", "🪟", "🪞", "🛁", "🚿", "🚽", "🪠", "🪒", "🧴", "🧷", "🧹", "🧺", "🪣", "🧼", "🪥", "🧽", "🧯", "🛒", "⚰️", "⚱️", "🗿"],
  },
];

export function generateMatchingPuzzle(
  seed: number,
  gridHeight: number = 4,
  mode: MatchingMode = 'silhouette',
  maxWordLength: number = 4
): MatchingPuzzle {
  const random = new SeededRandom(seed);

  // One pair per row
  const numPairs = gridHeight;

  if (mode === 'word') {
    // Only words the child can actually sound out, short enough to decode
    // without losing the thread. `decodable !== false` rather than `=== true`
    // so an untagged word is allowed rather than silently dropped.
    const pool = WORD_LIST.filter(
      w =>
        w.decodable !== false &&
        w.pictureClue !== false &&
        w.word.length <= maxWordLength
    );

    const picked = random.shuffle([...pool]).slice(0, numPairs);
    return {
      pairs: picked.map(entry => ({ left: entry.word, right: entry.emoji })),
      category: 'Words',
      mode,
    };
  }

  // Select a random category
  const categoryIndex = random.nextInt(MATCHING_CATEGORIES.length);
  const category = MATCHING_CATEGORIES[categoryIndex];

  // Select random emoji from the category
  // If we need more pairs than available, cycle through the category
  const selectedPairs: MatchingPair[] = [];
  const availableEmoji = [...category.emoji];

  for (let i = 0; i < numPairs; i++) {
    if (availableEmoji.length === 0) {
      // Refill from category if we run out
      availableEmoji.push(...category.emoji);
    }
    const index = random.nextInt(availableEmoji.length);
    const emoji = availableEmoji[index];
    // Create a pair where both left and right are the same emoji
    selectedPairs.push({ left: emoji, right: emoji });
    availableEmoji.splice(index, 1);
  }

  return {
    pairs: selectedPairs,
    category: category.name,
    mode,
  };
}
