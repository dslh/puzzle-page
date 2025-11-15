import { useMemo } from 'react';
import { generateWhichDoesntBelong } from './generator';
import styles from './WhichDoesntBelong.module.css';

interface WhichDoesntBelongProps {
  seed: number;
}

export default function WhichDoesntBelong({ seed }: WhichDoesntBelongProps) {
  const puzzle = useMemo(() => generateWhichDoesntBelong(seed), [seed]);

  return (
    <div className={styles.container}>
      <div className={styles.hint}>🟢🟢🟢🔴🟢</div>
      <div className={styles.itemsContainer}>
        {puzzle.items.map((item, index) => (
          <div key={index} className={styles.item}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
