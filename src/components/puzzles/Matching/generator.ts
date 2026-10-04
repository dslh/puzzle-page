import { WORD_LIST, type WordEntry } from '../WordSearch/wordList';

export type MatchingMode = 'silhouette' | 'word' | 'letter';

export interface MatchingPair {
  /**
   * Left column: an emoji in silhouette mode, the word itself in word mode,
   * an upper case letter in letter mode.
   */
  left: string;
  /** Right column: an emoji, or the lower case letter in letter mode. */
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

const WORD_LIST_BY_WORD = new Map(WORD_LIST.map(entry => [entry.word, entry]));

/**
 * Resolve a comma- or space-separated custom word list against `WORD_LIST`.
 *
 * This field is stricter than the custom-words field on every other puzzle,
 * and has to be: the right-hand column here is a picture, and there is nothing
 * to draw for a word the curated list has no emoji for. A word that isn't in
 * the list is reported back rather than quietly dropped, so the config bar can
 * tell the parent why it didn't appear.
 */
export function resolveCustomWords(customWordsText: string): {
  matched: WordEntry[];
  unmatched: string[];
} {
  const matched: WordEntry[] = [];
  const unmatched: string[] = [];
  const seen = new Set<string>();

  for (const raw of customWordsText.toUpperCase().split(/[,\s]+/)) {
    const word = raw.replace(/[^A-Z]/g, '');
    if (word.length === 0 || seen.has(word)) continue;
    seen.add(word);

    const entry = WORD_LIST_BY_WORD.get(word);
    if (entry) {
      matched.push(entry);
    } else {
      unmatched.push(word);
    }
  }

  return { matched, unmatched };
}

/**
 * True when `fragment` could still grow into a word we have a picture for.
 *
 * Lets the config bar hold its "no picture" warning while the parent is
 * part-way through typing a real word, instead of flashing a complaint at
 * every keystroke of D, DO, DOG.
 */
export function couldBeWord(fragment: string): boolean {
  if (fragment.length === 0) return true;
  for (const word of WORD_LIST_BY_WORD.keys()) {
    if (word.startsWith(fragment)) return true;
  }
  return false;
}

/**
 * Letters drawn on when the parent hasn't chosen any. Left out are the letters
 * whose two cases are the same shape at a different size (C, K, O, P, S, U, V,
 * W, X, Z) - matching those is a size comparison, not letter knowledge.
 */
const RANDOM_LETTERS = 'ABDEFGHIJLMNQRTY'.split('');

/** Upper case, de-duplicated letters from whatever the parent typed. */
export function parseLetters(customLettersText: string): string[] {
  return [...new Set(customLettersText.toUpperCase().replace(/[^A-Z]/g, ''))];
}

export function generateMatchingPuzzle(
  seed: number,
  gridHeight: number = 4,
  mode: MatchingMode = 'silhouette',
  maxWordLength: number = 4,
  customWordsText: string = '',
  customLettersText: string = ''
): MatchingPuzzle {
  const random = new SeededRandom(seed);

  // One pair per row
  const numPairs = gridHeight;

  if (mode === 'word') {
    // A custom word goes in exactly as typed - no length cap, no decodability
    // or picture-clue filter. The parent chose it on purpose, and resolving it
    // against the curated list has already guaranteed it has a picture.
    // Shuffled among themselves so a list longer than the puzzle still varies
    // on reroll.
    const custom = random.shuffle(resolveCustomWords(customWordsText).matched);
    const used = new Set(custom.map(entry => entry.word));

    // Auto-filled words are held to the usual bar: sound-out-able, short
    // enough to decode without losing the thread, and pictured by an emoji
    // that survives a mono printout. `decodable !== false` rather than
    // `=== true` so an untagged word is allowed rather than silently dropped.
    const pool = WORD_LIST.filter(
      w =>
        !used.has(w.word) &&
        w.decodable !== false &&
        w.pictureClue !== false &&
        w.word.length <= maxWordLength
    );

    // Custom words first, so a list from school always makes the cut.
    const picked = [...custom, ...random.shuffle(pool)].slice(0, numPairs);
    return {
      pairs: picked.map(entry => ({ left: entry.word, right: entry.emoji })),
      category: 'Words',
      mode,
    };
  }

  if (mode === 'letter') {
    // Chosen letters are used as given and nothing else is added - a parent
    // practising s, a, t, p wants exactly those, even if that leaves rows
    // spare. Shuffled so a list longer than the puzzle still varies on reroll.
    const custom = parseLetters(customLettersText);
    const pool = custom.length > 0 ? custom : RANDOM_LETTERS;
    const picked = random.shuffle(pool).slice(0, numPairs);
    return {
      pairs: picked.map(letter => ({ left: letter, right: letter.toLowerCase() })),
      category: 'Letters',
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
