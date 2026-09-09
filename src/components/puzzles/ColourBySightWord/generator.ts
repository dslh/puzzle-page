import { PICTURES, type Picture } from './pictures';
import { SIGHT_WORDS } from './sightWords';

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

  shuffle<T>(array: readonly T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

interface PaletteColour {
  /** The colour's name, printed as a word in the key. */
  name: string;
  /** Screen-only tint for the key. The page itself always prints mono. */
  hex: string;
}

/**
 * Colours a child is likely to have in a pencil case, and that are easy to tell
 * apart by name. No white (nothing to colour) and no black (it would bury the
 * word printed in the cell).
 */
const PALETTE: readonly PaletteColour[] = [
  { name: 'red', hex: '#d32f2f' },
  { name: 'blue', hex: '#1565c0' },
  { name: 'green', hex: '#2e7d32' },
  { name: 'yellow', hex: '#c69200' },
  { name: 'orange', hex: '#e65100' },
  { name: 'purple', hex: '#6a1b9a' },
  { name: 'brown', hex: '#5d4037' },
  { name: 'pink', hex: '#c2185b' },
];

export interface KeyEntry {
  /** The sight word printed in every cell of this region. */
  word: string;
  colour: string;
  hex: string;
}

export interface ColourBySightWordPuzzle {
  pictureName: string;
  cols: number;
  rows: number;
  /** Region index per cell, row-major. Index into `key`. */
  cells: number[];
  key: KeyEntry[];
}

/** '.' is the background; '1'-'3' are the foreground regions. */
function regionOf(char: string): number {
  return char === '.' ? 0 : Number(char);
}

/**
 * Picked from the seed alone, so resizing the puzzle never swaps the picture
 * out from under the child - only rerolling does.
 */
export function pickPicture(seed: number): Picture {
  return PICTURES[new SeededRandom(seed).nextInt(PICTURES.length)];
}

/**
 * Turn a picture's rows into region indices, merging the detail regions away
 * when fewer colours were asked for, then renumber so the surviving regions are
 * a dense 0..n-1 (a merged picture may leave a region unused, and a key entry
 * with no cells to colour would just confuse).
 */
function buildCells(picture: Picture, colourCount: number) {
  const maxRegion = colourCount - 1;
  const raw = picture.rows.flatMap(row =>
    [...row].map(char => Math.min(regionOf(char), maxRegion))
  );

  const used = [...new Set(raw)].sort((a, b) => a - b);
  const denseIndex = new Map(used.map((region, i) => [region, i]));

  return {
    cells: raw.map(region => denseIndex.get(region) as number),
    regionCount: used.length,
  };
}

/** Split a "the, and is" style config string into clean lowercase words. */
function parseCustomWords(text: string, maxWordLength: number): string[] {
  const seen = new Set<string>();
  return text
    .toLowerCase()
    .split(/[,\s]+/)
    .map(word => word.replace(/[^a-z']/g, ''))
    .filter(word => {
      if (word.length === 0 || word.length > maxWordLength) return false;
      if (seen.has(word)) return false;
      seen.add(word);
      return true;
    });
}

/**
 * Word pairs an early reader confuses: same length differing in a single letter
 * (are/ate, the/she), or the same letters reordered (was/saw, on/no) - the
 * classic reversal traps.
 *
 * Two of these on one sheet make it a trick rather than a reading exercise,
 * and the cost is high here: one misread word miscolours every cell of a
 * region, so the picture never resolves and the child cannot see why.
 */
function tooConfusable(a: string, b: string): boolean {
  if (a === b) return true;

  if (a.length === b.length) {
    let differences = 0;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) differences++;
    }
    if (differences <= 1) return true;
  }

  const letters = (word: string) => word.split('').sort().join('');
  return letters(a) === letters(b);
}

function chooseWords(
  random: SeededRandom,
  count: number,
  maxWordLength: number,
  customWordsText: string
): string[] {
  // Custom words win: the whole point of the field is that a parent can drive
  // the sheet from the list their child brought home. Shuffled among
  // themselves so rerolling still varies a long list.
  const custom = random.shuffle(parseCustomWords(customWordsText, maxWordLength));
  const taken = new Set(custom);

  const fitting = SIGHT_WORDS.filter(w => w.length <= maxWordLength && !taken.has(w));

  // Custom words go in exactly as given - the parent chose them deliberately.
  // Auto-picked words additionally avoid being confusable with anything already
  // on the sheet.
  const chosen = [...custom];
  for (const word of random.shuffle(fitting)) {
    if (chosen.length >= count) break;
    if (chosen.some(picked => tooConfusable(picked, word))) continue;
    chosen.push(word);
  }

  // Relax the confusability preference, then the length limit, rather than
  // leave a key entry with no word at all.
  for (const word of random.shuffle(fitting)) {
    if (chosen.length >= count) break;
    if (!chosen.includes(word)) chosen.push(word);
  }
  for (const word of random.shuffle(SIGHT_WORDS.filter(w => !taken.has(w)))) {
    if (chosen.length >= count) break;
    if (!chosen.includes(word)) chosen.push(word);
  }

  return chosen.slice(0, count);
}

/**
 * Pair each word with a colour. A word that names a colour keeps that colour:
 * a cell reading "blue" that has to be coloured green is a trap, not a reading
 * exercise.
 */
function assignColours(random: SeededRandom, words: string[]): KeyEntry[] {
  const pool = random.shuffle(PALETTE);
  const claimed = new Set<string>();

  const pinned = words.map(word => {
    const match = pool.find(c => c.name === word && !claimed.has(c.name));
    if (match) claimed.add(match.name);
    return match;
  });

  const spare = pool.filter(colour => !claimed.has(colour.name));
  let next = 0;
  return words.map((word, i) => {
    const colour = pinned[i] ?? spare[next++] ?? pool[i % pool.length];
    return { word, colour: colour.name, hex: colour.hex };
  });
}

export function generateColourBySightWord(
  picture: Picture,
  seed: number,
  colourCount: number,
  maxWordLength: number,
  customWordsText: string
): ColourBySightWordPuzzle {
  // Offset so the word shuffle doesn't march in step with the picture pick.
  const random = new SeededRandom(seed + 977);

  const { cells, regionCount } = buildCells(picture, colourCount);
  const words = chooseWords(random, regionCount, maxWordLength, customWordsText);

  return {
    pictureName: picture.name,
    cols: picture.rows[0].length,
    rows: picture.rows.length,
    cells,
    key: assignColours(random, words),
  };
}
