import { useMemo } from 'react';
import { generateMatchingPuzzle, type MatchingMode } from './generator';
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
}

export default function Matching({
  gridHeight = 4,
  seed,
  config,
}: PuzzleProps<MatchingConfig>) {
  const mode = config?.mode ?? 'silhouette';
  const maxWordLength = config?.maxWordLength ?? 4;

  const puzzle = useMemo(() => {
    const basePuzzle = generateMatchingPuzzle(seed, gridHeight, mode, maxWordLength);

    // Shuffle the right column for display
    const random = new SeededRandom(seed + 1); // Different seed for shuffling
    const shuffledRight = random.shuffle(basePuzzle.pairs.map(p => p.right));

    // Find where the first pair's match ended up in the shuffled right column
    const firstMatchIndex = shuffledRight.findIndex(emoji => emoji === basePuzzle.pairs[0].right);

    return {
      ...basePuzzle,
      shuffledRight,
      firstMatchIndex,
    };
  }, [seed, gridHeight, mode, maxWordLength]);

  const isWordMode = puzzle.mode === 'word';

  return (
    <div className={styles.container}>
      <div className={styles.matchingArea}>
        <div
          className={`${styles.column} ${isWordMode ? styles.wordColumn : ''}`}
        >
          {puzzle.pairs.map((pair, index) => (
            <div key={index} className={styles.item}>
              <span className={isWordMode ? styles.word : styles.emoji}>
                {pair.left}
              </span>
            </div>
          ))}
        </div>

        <div
          className={`${styles.connectingSpace} ${
            isWordMode ? styles.narrowConnector : ''
          }`}
        >
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
        </div>

        <div
          className={`${styles.column} ${
            isWordMode ? styles.wordRightColumn : ''
          }`}
        >
          {puzzle.shuffledRight.map((emoji, index) => (
            <div key={index} className={styles.item}>
              <span
                className={`${styles.emoji} ${
                  isWordMode ? '' : styles.silhouette
                }`}
              >
                {emoji}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
