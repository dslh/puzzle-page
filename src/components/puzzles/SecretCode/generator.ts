import { WORD_LIST, type WordEntry } from '../WordSearch/wordList';
import { firstSoundLetter, isEligible } from '../InitialSounds/generator';

/**
 * Layout, in mm. The component draws with these same numbers, so the generator
 * can work out how many words fit under the key before choosing them.
 */
export const LAYOUT = {
  padding: 2,
  keyCellWidth: 11,
  keyCellHeight: 16,
  keyEmoji: 7,
  keyLetter: 5,
  /** Space between the key and the first word. */
  keyGap: 4,
  slotWidth: 12,
  wordRowHeight: 23,
  wordEmoji: 9,
  /** The box a child writes the decoded letter in. */
  writeBox: 10,
};

/**
 * Pictures for the cipher key, picked to stay distinct once printed in mono:
 * no two differ mainly by colour (no red and green apples, no coloured
 * squares). Each carries the names a child might call it, so a picture is
 * never paired with the letter it starts with - the cipher should be learned
 * from the key, not guessed from the picture.
 */
const CIPHER_PICTURES: Array<{ emoji: string; names: string[] }> = [
  { emoji: '⭐', names: ['STAR'] },
  { emoji: '🌙', names: ['MOON'] },
  { emoji: '☀️', names: ['SUN'] },
  { emoji: '❄️', names: ['SNOWFLAKE', 'SNOW'] },
  { emoji: '⚡', names: ['LIGHTNING', 'BOLT'] },
  { emoji: '🔥', names: ['FIRE', 'FLAME'] },
  { emoji: '💧', names: ['DROP', 'WATER'] },
  { emoji: '☁️', names: ['CLOUD'] },
  { emoji: '❤️', names: ['HEART'] },
  { emoji: '🐟', names: ['FISH'] },
  { emoji: '🐢', names: ['TURTLE', 'TORTOISE'] },
  { emoji: '🦋', names: ['BUTTERFLY'] },
  { emoji: '🐌', names: ['SNAIL'] },
  { emoji: '🐘', names: ['ELEPHANT'] },
  { emoji: '🦒', names: ['GIRAFFE'] },
  { emoji: '🐍', names: ['SNAKE'] },
  { emoji: '🦀', names: ['CRAB'] },
  { emoji: '🐙', names: ['OCTOPUS'] },
  { emoji: '🐸', names: ['FROG'] },
  { emoji: '🐞', names: ['LADYBIRD', 'LADYBUG', 'BUG', 'BEETLE'] },
  { emoji: '🦆', names: ['DUCK'] },
  { emoji: '🌲', names: ['TREE'] },
  { emoji: '🍄', names: ['MUSHROOM', 'TOADSTOOL'] },
  { emoji: '🌵', names: ['CACTUS'] },
  { emoji: '🌸', names: ['FLOWER', 'BLOSSOM'] },
  { emoji: '🍎', names: ['APPLE'] },
  { emoji: '🍌', names: ['BANANA'] },
  { emoji: '🥕', names: ['CARROT'] },
  { emoji: '🍕', names: ['PIZZA'] },
  { emoji: '🍦', names: ['ICE CREAM'] },
  { emoji: '🦴', names: ['BONE'] },
  { emoji: '🎈', names: ['BALLOON'] },
  { emoji: '⚽', names: ['BALL', 'FOOTBALL'] },
  { emoji: '🔑', names: ['KEY'] },
  { emoji: '☂️', names: ['UMBRELLA'] },
  { emoji: '⚓', names: ['ANCHOR'] },
  { emoji: '🔔', names: ['BELL'] },
  { emoji: '🚗', names: ['CAR'] },
  { emoji: '✈️', names: ['PLANE', 'AEROPLANE', 'AIRPLANE'] },
  { emoji: '🚀', names: ['ROCKET'] },
  { emoji: '⛵', names: ['BOAT', 'SAILBOAT', 'SHIP'] },
  { emoji: '🏠', names: ['HOUSE', 'HOME'] },
  { emoji: '🎁', names: ['PRESENT', 'GIFT', 'BOX'] },
  { emoji: '👑', names: ['CROWN', 'KING', 'QUEEN'] },
  { emoji: '🎩', names: ['HAT'] },
  { emoji: '👓', names: ['GLASSES', 'SPECS'] },
  { emoji: '✂️', names: ['SCISSORS'] },
  { emoji: '💡', names: ['BULB', 'LIGHT'] },
  { emoji: '⏰', names: ['CLOCK', 'ALARM'] },
  { emoji: '🎸', names: ['GUITAR'] },
  { emoji: '🥁', names: ['DRUM'] },
];

export type KeyMode = 'cipher' | 'phonics';

export interface KeyEntry {
  /** Upper case. */
  letter: string;
  emoji: string;
}

export interface SecretCodePuzzle {
  /** Alphabetical, decoys included. */
  key: KeyEntry[];
  words: string[];
  keyRows: number;
  keyPerRow: number;
  slotsPerRow: number;
  /** Custom words left out for want of room, for an on-screen note. */
  skipped: string[];
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

/**
 * Phonics key pictures, by the letter they start with. These are the Initial
 * Sounds pictures, which already pass its checks for a clean first sound and a
 * picture that can't be named another way, plus the extras below. Q and X
 * have none, so can't appear in a phonics key.
 */
const PHONICS_PICTURES = new Map<string, Array<Pick<WordEntry, 'word' | 'emoji'>>>();
for (const w of WORD_LIST) {
  if (!isEligible(w)) continue;
  const letter = firstSoundLetter(w.word)!;
  PHONICS_PICTURES.set(letter, [...(PHONICS_PICTURES.get(letter) ?? []), w]);
}

// Initial Sounds wants the letter's usual sound, which leaves I and U with no
// picture at all - and without them a third of the words can't be spelled.
// A key only has to remind the child of the letter, so a long vowel (ICE) or
// a word too long for the word list (UMBRELLA) does here. Q and X stay out.
const PHONICS_EXTRAS: Array<[string, Pick<WordEntry, 'word' | 'emoji'>]> = [
  ['I', { word: 'ICE', emoji: '🧊' }],
  ['U', { word: 'UMBRELLA', emoji: '☂️' }],
  ['Y', { word: 'YOYO', emoji: '🪀' }],
];
for (const [letter, picture] of PHONICS_EXTRAS) {
  PHONICS_PICTURES.set(letter, [...(PHONICS_PICTURES.get(letter) ?? []), picture]);
}

/** Letters a word uses that the key can't show in this mode. */
export function missingLetters(word: string, mode: KeyMode): string[] {
  if (mode === 'cipher') return [];
  return [...new Set(word.split(''))].filter((l) => !PHONICS_PICTURES.has(l));
}

/** Upper case words typed into the config field, deduplicated. */
export function parseCustomWords(text: string): string[] {
  const words = text
    .toUpperCase()
    .split(/[,\s]+/)
    .map((w) => w.replace(/[^A-Z]/g, ''))
    .filter((w) => w.length > 0);
  return [...new Set(words)];
}

// Decoys fill out the key's last row. When that would leave fewer than this
// many, they start another row instead - if there's room for it.
const MIN_DECOYS = 2;

function keySize(letterCount: number, minDecoys: number, perRow: number, available: number) {
  const rows = Math.ceil((letterCount + minDecoys) / perRow);
  return Math.min(available, rows * perRow);
}

function buildKey(
  rng: SeededRandom,
  letters: string[],
  mode: KeyMode,
  words: string[]
): KeyEntry[] {
  if (mode === 'phonics') {
    // A picture of an answer word would give that word away, so steer round
    // them when the letter has any other picture.
    const answers = new Set(words);
    return letters.map((letter) => {
      const options = PHONICS_PICTURES.get(letter)!;
      const others = options.filter((w) => !answers.has(w.word));
      const pool = others.length > 0 ? others : options;
      return { letter, emoji: pool[rng.nextInt(pool.length)].emoji };
    });
  }

  const pictures = rng.shuffle(CIPHER_PICTURES);
  return letters.map((letter) => {
    let index = pictures.findIndex((p) => !p.names.some((n) => n[0] === letter));
    if (index < 0) index = 0;
    const [picture] = pictures.splice(index, 1);
    return { letter, emoji: picture.emoji };
  });
}

export function generateSecretCode(
  seed: number,
  innerWidthMm: number,
  innerHeightMm: number,
  mode: KeyMode,
  decoys: boolean,
  customWordsText: string
): SecretCodePuzzle {
  const rng = new SeededRandom(seed);
  const keyPerRow = Math.max(1, Math.floor(innerWidthMm / LAYOUT.keyCellWidth));
  const slotsPerRow = Math.max(1, Math.floor(innerWidthMm / LAYOUT.slotWidth));

  const alphabet =
    mode === 'phonics'
      ? [...PHONICS_PICTURES.keys()].sort()
      : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const fits = (word: string) =>
    word.length <= slotsPerRow && missingLetters(word, mode).length === 0;

  // Custom words come first, as on Handwriting, then the word list fills any
  // rows they leave. Words the key can't spell are named in the config bar.
  const custom = parseCustomWords(customWordsText).filter(
    (w) => missingLetters(w, mode).length === 0
  );
  const pool = rng.shuffle(
    WORD_LIST.filter(
      (w) => w.decodable !== false && fits(w.word) && !custom.includes(w.word)
    ).map((w) => w.word)
  );
  const candidates = [...custom.filter(fits), ...pool];

  // More words need more key letters, and a taller key leaves less room for
  // words, so find the most that fit together.
  const maxWords = Math.floor(
    (innerHeightMm - LAYOUT.keyCellHeight - LAYOUT.keyGap) / LAYOUT.wordRowHeight
  );
  let words: string[] = [];
  let letters: string[] = [];
  let keyCount = 0;
  search: for (let n = Math.min(maxWords, candidates.length); n >= 1; n--) {
    const chosen = candidates.slice(0, n);
    const used = [...new Set(chosen.join(''))];
    const sizes = decoys
      ? [MIN_DECOYS, 0].map((min) => keySize(used.length, min, keyPerRow, alphabet.length))
      : [used.length];
    for (const count of sizes) {
      const rows = Math.ceil(count / keyPerRow);
      const height = rows * LAYOUT.keyCellHeight + LAYOUT.keyGap + n * LAYOUT.wordRowHeight;
      if (height <= innerHeightMm) {
        words = chosen;
        letters = used;
        keyCount = count;
        break search;
      }
    }
  }

  const spare = rng.shuffle(alphabet.filter((l) => !letters.includes(l)));
  const keyLetters = [...letters, ...spare.slice(0, keyCount - letters.length)].sort();

  return {
    key: buildKey(rng, keyLetters, mode, words),
    words,
    keyRows: Math.ceil(keyLetters.length / keyPerRow),
    keyPerRow,
    slotsPerRow,
    skipped: custom.filter((w) => !words.includes(w)),
  };
}
