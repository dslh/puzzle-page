import { useMemo } from 'react';
import { generateOrderingRow, getItemCount } from './generator';
import type { PuzzleProps } from '../../../types/puzzle';
import styles from './Ordering.module.css';

export interface OrderingConfig {
  mode: 'numbers' | 'emoji';
}

export default function Ordering({
  gridWidth = 5,
  gridHeight = 3,
  seed,
  config,
}: PuzzleProps<OrderingConfig>) {
  const mode = config?.mode ?? 'numbers';
  const itemCount = getItemCount(gridWidth);

  // Generate one ordering row per grid row
  const rows = useMemo(() => {
    return Array.from({ length: gridHeight }, (_, i) => {
      return generateOrderingRow(seed + i * 1000, itemCount, mode);
    });
  }, [gridHeight, seed, itemCount, mode]);

  return (
    <div className={styles.container}>
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className={styles.row}>
          {row.items.map((item, itemIndex) => (
            <div key={itemIndex} className={styles.itemContainer}>
              <span
                className={styles.item}
                style={item.fontSize ? { fontSize: `${item.fontSize}mm` } : undefined}
              >
                {item.display}
              </span>
              <div className={styles.answerBox}></div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
