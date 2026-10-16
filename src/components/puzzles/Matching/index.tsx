import { useMemo } from 'react';
import {
  generateMatchingPuzzle,
  type MatchingMode,
  type RhymeDisplay,
} from './generator';
import type { PuzzleProps } from '../../../types/puzzle';
import styles from './Matching.module.css';

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

export interface MatchingConfig {
  mode: MatchingMode;
  /** Word mode only: longest word to draw from the list. */
  maxWordLength: 3 | 4 | 5;
  /**
   * Word mode only: words the parent typed, comma or space separated. Only
   * entries in `WORD_LIST` are usable here - see `resolveCustomWords`.
   */
  customWordsText?: string;
  /**
   * Letter mode only: the letters to match, in any case and with any
   * separators. Empty means a random selection.
   */
  customLettersText?: string;
  /** Rhyme mode only: show pictures, words, or a picture captioned by its word. */
  rhymeDisplay?: RhymeDisplay;
  /** Draw the first pair's line as a dashed guide. Defaults to true. */
  workedExample?: boolean;
}

export default function Matching({
  gridHeight = 4,
  seed,
  config,
}: PuzzleProps<MatchingConfig>) {
  const mode = config?.mode ?? 'silhouette';
  const maxWordLength = config?.maxWordLength ?? 4;
  const customWordsText = config?.customWordsText ?? '';
  const customLettersText = config?.customLettersText ?? '';
  const rhymeDisplay = config?.rhymeDisplay ?? 'pictures';
  const workedExample = config?.workedExample ?? true;

  const puzzle = useMemo(() => {
    const basePuzzle = generateMatchingPuzzle(
      seed,
      gridHeight,
      mode,
      maxWordLength,
      customWordsText,
      customLettersText,
      rhymeDisplay
    );

    // Shuffle the right column for display
    const random = new SeededRandom(seed + 1); // Different seed for shuffling
    const shuffledRight = random.shuffle(
      basePuzzle.pairs.map(p => ({ symbol: p.right, word: p.rightWord }))
    );

    // Find where the first pair's match ended up in the shuffled right column
    const firstMatchIndex = shuffledRight.findIndex(
      item => item.symbol === basePuzzle.pairs[0].right
    );

    return {
      ...basePuzzle,
      shuffledRight,
      firstMatchIndex,
    };
  }, [seed, gridHeight, mode, maxWordLength, customWordsText, customLettersText, rhymeDisplay]);

  const isWordMode = puzzle.mode === 'word';
  const isLetterMode = puzzle.mode === 'letter';
  const isRhymeMode = puzzle.mode === 'rhyme';
  const isHomesMode = puzzle.mode === 'homes';
  // Rhyme words need room on both sides, not just the left as in word mode.
  const isRhymeWide = isRhymeMode && rhymeDisplay !== 'pictures';
  const leftClass = isWordMode ? styles.word : isLetterMode ? styles.letter : styles.emoji;
  const rightClass = isLetterMode
    ? styles.letter
    : `${styles.emoji} ${isWordMode || isRhymeMode || isHomesMode ? '' : styles.silhouette}`;

  const renderCell = (symbol: string, className: string, word?: string) => {
    if (!isRhymeMode) return <span className={className}>{symbol}</span>;
    if (rhymeDisplay === 'words') return <span className={styles.word}>{word}</span>;
    if (rhymeDisplay === 'both') {
      return (
        <span className={styles.captioned}>
          <span className={styles.emoji}>{symbol}</span>
          <span className={styles.caption}>{word}</span>
        </span>
      );
    }
    return <span className={styles.emoji}>{symbol}</span>;
  };

  return (
    <div className={styles.container}>
      <div className={styles.matchingArea}>
        <div
          className={`${styles.column} ${
            isWordMode ? styles.wordColumn : isRhymeWide ? styles.rhymeColumn : ''
          }`}
        >
          {puzzle.pairs.map((pair, index) => (
            <div key={index} className={styles.item}>
              {renderCell(pair.left, leftClass, pair.leftWord)}
            </div>
          ))}
        </div>

        <div
          className={`${styles.connectingSpace} ${
            isWordMode ? styles.narrowConnector : isRhymeWide ? styles.rhymeConnector : ''
          }`}
        >
          {workedExample && (
            <svg className={styles.exampleLine} viewBox="0 0 100 100" preserveAspectRatio="none">
              <line
                x1="0"
                y1={((0.5 + 0) / puzzle.pairs.length) * 100}
                x2="100"
                y2={((0.5 + puzzle.firstMatchIndex) / puzzle.pairs.length) * 100}
                stroke="#999"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            </svg>
          )}
        </div>

        <div
          className={`${styles.column} ${
            isWordMode ? styles.wordRightColumn : isRhymeWide ? styles.rhymeColumn : ''
          }`}
        >
          {puzzle.shuffledRight.map((item, index) => (
            <div key={index} className={styles.item}>
              {renderCell(item.symbol, rightClass, item.word)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
