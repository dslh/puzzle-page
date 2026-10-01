import { useMemo } from 'react';
import { generateTakeAway, type BlankMode } from './generator';
import type { PuzzleProps } from '../../../types/puzzle';
import styles from './TakeAway.module.css';

export interface TakeAwayConfig {
  blankMode: BlankMode;
  workedExample: boolean;
}

/**
 * From this many emoji up, rows are split into fives so they can be counted in
 * chunks rather than one long line. Below it the extra gaps are just noise.
 */
const GROUP_FROM = 10;
const GROUP_SIZE = 5;

export default function TakeAway({
  gridWidth = 7,
  gridHeight = 4,
  seed,
  config,
}: PuzzleProps<TakeAwayConfig>) {
  const blankMode = config?.blankMode ?? 'answer';
  const workedExample = config?.workedExample ?? true;

  // One problem per grid row
  const problems = useMemo(
    () => generateTakeAway(gridHeight, gridWidth, seed, blankMode, workedExample),
    [gridHeight, gridWidth, seed, blankMode, workedExample]
  );

  return (
    <div className={styles.container}>
      {problems.map((problem, rowIndex) => {
        const isExample = workedExample && rowIndex === 0;
        // The last `take` emoji are the ones crossed out
        const firstCrossed = problem.start - problem.take;
        const grouped = problem.start >= GROUP_FROM;

        const blankBox = (value: number) => (
          <span className={styles.answerBox}>
            {isExample && <span className={styles.filledIn}>{value}</span>}
          </span>
        );

        return (
          <div key={rowIndex} className={styles.row}>
            <span className={styles.emojis}>
              {Array.from({ length: problem.start }, (_, i) => (
                <span
                  key={i}
                  className={[
                    styles.emoji,
                    isExample && i >= firstCrossed ? styles.crossed : '',
                    grouped && i > 0 && i % GROUP_SIZE === 0 ? styles.groupStart : '',
                  ].join(' ')}
                >
                  {problem.emoji}
                </span>
              ))}
            </span>
            <span className={styles.equation}>
              <span className={styles.number}>{problem.start}</span>
              <span className={styles.operator}>−</span>
              {problem.blank === 'taken'
                ? blankBox(problem.take)
                : <span className={styles.number}>{problem.take}</span>}
              <span className={styles.operator}>=</span>
              {problem.blank === 'answer'
                ? blankBox(problem.answer)
                : <span className={styles.number}>{problem.answer}</span>}
            </span>
          </div>
        );
      })}
    </div>
  );
}
