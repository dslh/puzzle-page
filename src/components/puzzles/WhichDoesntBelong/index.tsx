import { useMemo } from 'react';
import { generateWhichDoesntBelong } from './generator';
import styles from './WhichDoesntBelong.module.css';

interface WhichDoesntBelongProps {
  gridHeight?: number; // Number of grid cells (rows) allocated
  seed: number;
}

export default function WhichDoesntBelong({ gridHeight = 1, seed }: WhichDoesntBelongProps) {
  // Generate one puzzle per row
  const puzzles = useMemo(() => {
    return Array.from({ length: gridHeight }, (_, i) =>
      generateWhichDoesntBelong(seed + i)
    );
  }, [gridHeight, seed]);

  return (
    <div className={styles.container}>
      <div className={styles.hint}>🟢🟢🟢🔴🟢</div>
      {puzzles.map((puzzle, rowIndex) => (
        <div key={rowIndex} className={styles.row}>
          <div className={styles.itemsContainer}>
            {puzzle.items.map((item, index) => (
              <div key={index} className={styles.item}>
                {item}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
