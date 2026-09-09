import { WORD_LIST, type PuzzleWord } from '../WordSearch/wordList';

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

const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);

// Shown next to custom words that aren't in the illustrated word list
const FALLBACK_EMOJI = '✏️';

export interface HandwritingRow {
  word: string; // canonical uppercase; the component applies the display case
  emoji: string;
  missingIndex: number; // letter to leave blank in "missing letter" mode
}

export interface HandwritingPuzzle {
  rows: HandwritingRow[];
}

/**
 * Pick the letter to blank out. Vowels are the classic target ("c_t", "b_s"),
 * and the first letter is never chosen - with it gone there's too little left
 * to work back from.
 */
function pickMissingIndex(word: string, random: SeededRandom): number {
  const vowels: number[] = [];
  const consonants: number[] = [];
  for (let i = 1; i < word.length; i++) {
    if (VOWELS.has(word[i])) {
      vowels.push(i);
    } else {
      consonants.push(i);
    }
  }

  const candidates = vowels.length > 0 ? vowels : consonants;
  if (candidates.length === 0) return 0; // single-letter word
  return candidates[random.nextInt(candidates.length)];
}

export function generateHandwriting(
  seed: number,
  wordCount: number,
  maxWordLength: number,
  customWordsText: string = ''
): HandwritingPuzzle {
  const random = new SeededRandom(seed);

  const wordListMap = new Map(WORD_LIST.map(w => [w.word, w.emoji]));

  // Custom words come first so a spelling list from school always makes the cut
  const used = new Set<string>();
  const customWords: PuzzleWord[] = customWordsText
    .toUpperCase()
    .split(/[,\s]+/)
    .map(w => w.replace(/[^A-Z]/g, ''))
    .filter(w => w.length > 0 && w.length <= maxWordLength)
    .filter(w => {
      if (used.has(w)) return false;
      used.add(w);
      return true;
    })
    .map(word => ({ word, emoji: wordListMap.get(word) ?? FALLBACK_EMOJI }));

  const selected: PuzzleWord[] = customWords.slice(0, wordCount);

  if (selected.length < wordCount) {
    const pool = WORD_LIST.filter(
      w => w.word.length <= maxWordLength && !used.has(w.word)
    );
    selected.push(...random.shuffle(pool).slice(0, wordCount - selected.length));
  }

  return {
    rows: selected.map(entry => ({
      word: entry.word,
      emoji: entry.emoji,
      missingIndex: pickMissingIndex(entry.word, random),
    })),
  };
}
