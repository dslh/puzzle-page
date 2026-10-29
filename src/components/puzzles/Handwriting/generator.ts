import { WORD_LIST, type PuzzleWord } from '../WordSearch/wordList';
import type { LeftOutWords } from '../../LeftOutNotice';
import { SeededRandom } from '../../../utils/random';

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
  leftOut: LeftOutWords;
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
  const typed = customWordsText
    .toUpperCase()
    .split(/[,\s]+/)
    .map(w => w.replace(/[^A-Z]/g, ''))
    .filter(w => {
      if (w.length === 0 || used.has(w)) return false;
      used.add(w);
      return true;
    });
  const customWords: PuzzleWord[] = typed
    .filter(w => w.length <= maxWordLength)
    .map(word => ({ word, emoji: wordListMap.get(word) ?? FALLBACK_EMOJI }));

  const selected: PuzzleWord[] = customWords.slice(0, wordCount);
  const leftOut: LeftOutWords = {
    tooLong: typed.filter(w => w.length > maxWordLength),
    noRoom: customWords.slice(wordCount).map(w => w.word),
  };

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
    leftOut,
  };
}
