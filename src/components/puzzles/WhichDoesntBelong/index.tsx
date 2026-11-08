import { useMemo } from 'react';
import { generateWhichDoesntBelong } from './generator';
import type { PuzzleProps } from '../../../types/puzzle';
import AnswerCircle from '../../AnswerCircle';
import styles from './WhichDoesntBelong.module.css';

export default function WhichDoesntBelong({ showAnswers = false, gridHeight = 1, seed }: PuzzleProps) {
  // Generate one puzzle per row
  const puzzles = useMemo(
    () => generateWhichDoesntBelong(seed, gridHeight),
    [gridHeight, seed]
  );

  return (
    <div className={styles.container}>
      <div className={styles.hint}>🟢🟢🟢🔴🟢</div>
      {puzzles.map((puzzle, rowIndex) => (
        <div key={rowIndex} className={styles.row}>
          <div className={styles.itemsContainer}>
            {puzzle.items.map((item, index) => (
              <div key={index} className={styles.item} data-answer-circle={showAnswers && index === puzzle.outlierIndex || undefined}>
                {item}
                {showAnswers && index === puzzle.outlierIndex && <AnswerCircle seed={`${seed}:outlier:${rowIndex}:${index}`} />}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
