import { WORD_LIST, type WordEntry } from '../WordSearch/wordList';
import { HOMES, HOME_ANIMALS, type HomeAnimal, type HomeId } from './habitats';

export type MatchingMode = 'silhouette' | 'word' | 'letter' | 'rhyme' | 'homes';

/** Rhyme mode only: what each side shows. */
export type RhymeDisplay = 'pictures' | 'words' | 'both';

export interface MatchingPair {
  /**
   * Left column: an emoji in silhouette mode, the word itself in word mode,
   * an upper case letter in letter mode, an emoji in rhyme mode, an animal
   * in homes mode.
   */
  left: string;
  /**
   * Right column: an emoji, the lower case letter in letter mode, or where the
   * animal lives in homes mode.
   */
  right: string;
  /** Rhyme mode only: the words the two emoji stand for. */
  leftWord?: string;
  rightWord?: string;
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

/**
 * Words that rhyme, grouped by `rime` - never by trailing letters, which would
 * pair GOAT with CAT. Only groups with at least two usable words survive.
 *
 * Which words are usable depends on what the child has to go on. With
 * pictures on show, the emoji must name the word by itself; with words alone,
 * the child must be able to sound it out, and the emoji doesn't matter.
 */
function rhymeGroups(display: RhymeDisplay): WordEntry[][] {
  const groups = new Map<string, WordEntry[]>();
  for (const entry of WORD_LIST) {
    const usable =
      display === 'words'
        ? entry.decodable !== false
        : entry.pictureClue !== false;
    if (!usable) continue;
    const group = groups.get(entry.rime);
    if (group) group.push(entry);
    else groups.set(entry.rime, [entry]);
  }
  return [...groups.values()].filter(group => group.length >= 2);
}

/**
 * One animal per home, chosen so that no animal on the page also fits another
 * home on the page - see `alsoFits` in `habitats.ts`. Greedy over a shuffled
 * list of homes, so with ten homes and rows to spare a puzzle may come up a
 * pair or two short of the row count rather than show an arguable line.
 */
function pickHomePairs(random: SeededRandom, numPairs: number): MatchingPair[] {
  const picked: { home: HomeId; animal: HomeAnimal }[] = [];
  const fits = (animal: HomeAnimal, home: HomeId) =>
    animal.home === home || (animal.alsoFits ?? []).includes(home);

  for (const home of random.shuffle(HOMES)) {
    if (picked.length >= numPairs) break;
    // A home some animal already on the page could also go to.
    if (picked.some(p => fits(p.animal, home.id))) continue;

    const animal = random
      .shuffle(HOME_ANIMALS.filter(a => a.home === home.id))
      .find(a => !picked.some(p => fits(a, p.home)));
    if (animal) picked.push({ home: home.id, animal });
  }

  return picked.map(({ home, animal }) => ({
    left: animal.emoji,
    right: HOMES.find(h => h.id === home)!.emoji,
  }));
}

export function generateMatchingPuzzle(
  seed: number,
  gridHeight: number = 4,
  mode: MatchingMode = 'silhouette',
  maxWordLength: number = 4,
  customWordsText: string = '',
  customLettersText: string = '',
  rhymeDisplay: RhymeDisplay = 'pictures'
): MatchingPuzzle {
  const random = new SeededRandom(seed);

  // One pair per row
  const numPairs = gridHeight;

  if (mode === 'rhyme') {
    // One rime group per pair, so no left-hand word rhymes with more than
    // one right-hand word and every line has exactly one right answer.
    const groups = random.shuffle(rhymeGroups(rhymeDisplay)).slice(0, numPairs);
    return {
      pairs: groups.map(group => {
        const [a, b] = random.shuffle(group);
        return { left: a.emoji, right: b.emoji, leftWord: a.word, rightWord: b.word };
      }),
      category: 'Rhymes',
      mode,
    };
  }

  if (mode === 'homes') {
    return { pairs: pickHomePairs(random, numPairs), category: 'Homes', mode };
  }

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
