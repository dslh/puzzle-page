import { WORD_LIST, type WordEntry } from '../WordSearch/wordList';
import { firstSoundLetter, isEligible } from '../InitialSounds/generator';
import { SeededRandom } from '../../../utils/random';

/**
 * Layout, in mm. The component draws with these same numbers, so the generator
 * can work out how many words fit under the key before choosing them.
 */
export const LAYOUT = {
  padding: 2,
  keyCellWidth: 9,
  keyCellHeight: 12,
  keyEmoji: 6,
  keyLetter: 4.5,
  /** Space between the key and the first row of words. */
  keyGap: 3,
  slotWidth: 10,
  wordRowHeight: 18,
  wordEmoji: 7,
  /** The box a child writes the decoded letter in. */
  writeBox: 9,
  /** Empty slots between two words sharing a row. */
  wordGapSlots: 1,
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
  /** The words again, packed into rows - several to a row when they fit. */
  rows: string[][];
  keyRows: number;
  keyPerRow: number;
  slotsPerRow: number;
  /** Custom words left out for want of room, for an on-screen note. */
  skipped: string[];
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

/**
 * Packs words into rows, each into the first row with room for it. Order is
 * mostly kept, but a short word can slip back to fill a gap.
 */
function packRows(words: string[], slotsPerRow: number): string[][] {
  const rows: string[][] = [];
  const widths: number[] = [];
  for (const word of words) {
    const i = widths.findIndex((w) => w + LAYOUT.wordGapSlots + word.length <= slotsPerRow);
    if (i >= 0) {
      rows[i].push(word);
      widths[i] += LAYOUT.wordGapSlots + word.length;
    } else {
      rows.push([word]);
      widths.push(word.length);
    }
  }
  return rows;
}

// How many shuffled candidates each pick chooses between. Bigger finds more
// shared letters, but tends towards the same few short, overlapping words.
const SHARING_SAMPLE = 30;

/**
 * Orders words so each one reuses as many of the earlier words' letters as it
 * can. A key whose every letter is used just once is a dull key: the child
 * only gets the satisfaction of "I know that one!" when pictures come back.
 * `fixed` words (the parent's) always come first, in their own order.
 */
function orderBySharedLetters(fixed: string[], pool: string[], count: number): string[] {
  const letters = new Set(fixed.join(''));
  const result = [...fixed];
  const remaining = [...pool];
  while (result.length < count && remaining.length > 0) {
    // Share of the word's letters the key doesn't have yet; lowest wins, and
    // the shuffle breaks ties.
    const newShare = (word: string) =>
      [...new Set(word)].filter((l) => !letters.has(l)).length / word.length;
    let best = 0;
    for (let i = 1; i < Math.min(SHARING_SAMPLE, remaining.length); i++) {
      if (newShare(remaining[i]) < newShare(remaining[best])) best = i;
    }
    const [word] = remaining.splice(best, 1);
    result.push(word);
    for (const l of word) letters.add(l);
  }
  return result;
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

  // An upper bound: every row full of three letter words.
  const maxRows = Math.floor(
    (innerHeightMm - LAYOUT.keyCellHeight - LAYOUT.keyGap) / LAYOUT.wordRowHeight
  );
  const maxWords = maxRows * Math.max(1, Math.floor((slotsPerRow + LAYOUT.wordGapSlots) / (3 + LAYOUT.wordGapSlots)));
  const candidates = orderBySharedLetters(custom.filter(fits), pool, maxWords);

  // More words need more key letters, and a taller key leaves less room for
  // words, so find the most that fit together.
  let words: string[] = [];
  let rows: string[][] = [];
  let letters: string[] = [];
  let keyCount = 0;
  search: for (let n = candidates.length; n >= 1; n--) {
    const chosen = candidates.slice(0, n);
    const packed = packRows(chosen, slotsPerRow);
    const used = [...new Set(chosen.join(''))];
    const sizes = decoys
      ? [MIN_DECOYS, 0].map((min) => keySize(used.length, min, keyPerRow, alphabet.length))
      : [used.length];
    for (const count of sizes) {
      const keyRows = Math.ceil(count / keyPerRow);
      const height =
        keyRows * LAYOUT.keyCellHeight + LAYOUT.keyGap + packed.length * LAYOUT.wordRowHeight;
      if (height <= innerHeightMm) {
        words = chosen;
        rows = packed;
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
    rows,
    keyRows: Math.ceil(keyLetters.length / keyPerRow),
    keyPerRow,
    slotsPerRow,
    skipped: custom.filter((w) => !words.includes(w)),
  };
}
