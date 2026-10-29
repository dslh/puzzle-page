import { useMemo } from 'react';
import {
  generateMatchingPuzzle,
  type HalvesPairs,
  type MatchingMode,
  type RhymeDisplay,
} from './generator';
import type { PuzzleProps } from '../../../types/puzzle';
import styles from './Matching.module.css';
import { SeededRandom } from '../../../utils/random';

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
  /** Halves mode only: 2 or 3 pairs for the youngest, or one a row. */
  halvesPairs?: HalvesPairs;
  /**
   * Halves mode only: use only pictures whose outline tells them apart, for
   * black and white printing. Off, round faces and fruit are in too.
   */
  distinctShapes?: boolean;
  /** Draw the first pair's line as a dashed guide. Defaults to true. */
  workedExample?: boolean;
}

/** On-paper size of a grid cell in CSS px (19mm). */
const CELL_PX = (19 / 25.4) * 96;

export default function Matching({
  gridWidth = 5,
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
  const halvesPairs = config?.halvesPairs ?? 'rows';
  const distinctShapes = config?.distinctShapes ?? false;

  const puzzle = useMemo(() => {
    const basePuzzle = generateMatchingPuzzle(
      seed,
      gridHeight,
      mode,
      maxWordLength,
      customWordsText,
      customLettersText,
      rhymeDisplay,
      halvesPairs,
      distinctShapes
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
  }, [
    seed,
    gridHeight,
    mode,
    maxWordLength,
    customWordsText,
    customLettersText,
    rhymeDisplay,
    halvesPairs,
    distinctShapes,
  ]);

  const isWordMode = puzzle.mode === 'word';
  const isLetterMode = puzzle.mode === 'letter';
  const isRhymeMode = puzzle.mode === 'rhyme';
  const isHomesMode = puzzle.mode === 'homes';
  const isHalvesMode = puzzle.mode === 'halves';
  // Rhyme words need room on both sides, not just the left as in word mode.
  const isRhymeWide = isRhymeMode && rhymeDisplay !== 'pictures';
  const leftClass = isWordMode ? styles.word : isLetterMode ? styles.letter : styles.emoji;
  const rightClass = isLetterMode
    ? styles.letter
    : `${styles.emoji} ${isWordMode || isRhymeMode || isHomesMode || isHalvesMode ? '' : styles.silhouette}`;

  // Halves grow into the room that fewer pairs leave, but a half (0.7em
  // wide, see the CSS) must still fit its 20% column.
  const halfSize = Math.round(
    Math.min(
      (gridHeight * CELL_PX) / Math.max(puzzle.pairs.length, 1) * 0.65,
      ((gridWidth * CELL_PX * 0.2) - 16) / 0.7,
      96
    )
  );

  const renderHalf = (symbol: string, side: 'left' | 'right') => (
    <span className={styles.half} style={{ fontSize: halfSize }}>
      <span className={side === 'left' ? styles.halfLeft : styles.halfRight}>{symbol}</span>
    </span>
  );

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
            <div key={index} className={`${styles.item} ${isHalvesMode ? styles.leftHalfItem : ''}`}>
              {isHalvesMode
                ? renderHalf(pair.left, 'left')
                : renderCell(pair.left, leftClass, pair.leftWord)}
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
            <div key={index} className={`${styles.item} ${isHalvesMode ? styles.rightHalfItem : ''}`}>
              {isHalvesMode
                ? renderHalf(item.symbol, 'right')
                : renderCell(item.symbol, rightClass, item.word)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
