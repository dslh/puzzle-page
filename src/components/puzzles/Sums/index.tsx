import { useMemo } from 'react';
import { generateSums, type SumsMode } from './generator';
import type { PuzzleProps } from '../../../types/puzzle';
import styles from './Sums.module.css';

export interface SumsConfig {
  mode: SumsMode;
}

/** Grid cells one `3 + 4 = ▢` problem needs to stay readable at print size. */
const CELLS_PER_PROBLEM = 2;

export default function Sums({
  gridWidth = 4,
  gridHeight = 3,
  seed,
  config,
}: PuzzleProps<SumsConfig>) {
  const mode = config?.mode ?? 'both';
  const columns = Math.max(1, Math.floor(gridWidth / CELLS_PER_PROBLEM));

  // One row of problems per grid row
  const problems = useMemo(
    () => generateSums(columns * gridHeight, seed, mode),
    [columns, gridHeight, seed, mode]
  );

  return (
    <div className={styles.container}>
      {Array.from({ length: gridHeight }, (_, rowIndex) => (
        <div key={rowIndex} className={styles.row}>
          {problems
            .slice(rowIndex * columns, (rowIndex + 1) * columns)
            .map((problem, colIndex) => (
              <div key={colIndex} className={styles.problem}>
                <span className={styles.number}>{problem.left}</span>
                <span className={styles.operator}>{problem.operator}</span>
                <span className={styles.number}>{problem.right}</span>
                <span className={styles.operator}>=</span>
                <span className={styles.answerBox}></span>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}
