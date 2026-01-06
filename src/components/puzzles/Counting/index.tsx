import { useMemo } from 'react';
import { generateCountingRow } from './generator';
import type { PuzzleProps } from '../../../types/puzzle';
import styles from './Counting.module.css';

export default function Counting({ gridWidth = 4, gridHeight = 3, seed }: PuzzleProps) {
  // Calculate item count range based on grid width
  const minItems = Math.max(1, gridWidth - 3);
  const maxItems = gridWidth + 2;

  // Generate one counting row per grid row
  const rows = useMemo(() => {
    return Array.from({ length: gridHeight }, (_, i) => {
      return generateCountingRow(seed + i * 1000, minItems, maxItems);
    });
  }, [gridHeight, seed, minItems, maxItems]);

  return (
    <div className={styles.container}>
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className={styles.row}>
          <span className={styles.emojis}>
            {Array.from({ length: row.count }, (_, i) => (
              <span key={i} className={styles.emoji}>{row.emoji}</span>
            ))}
          </span>
          <span className={styles.equals}>=</span>
          <span className={styles.blank}></span>
        </div>
      ))}
    </div>
  );
}
