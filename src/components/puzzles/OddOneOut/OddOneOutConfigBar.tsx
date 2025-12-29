import type { OddOneOutConfig } from './index';
import styles from './OddOneOutConfigBar.module.css';

interface OddOneOutConfigBarProps {
  value: OddOneOutConfig;
  onChange: (config: OddOneOutConfig) => void;
}

export default function OddOneOutConfigBar({ value, onChange }: OddOneOutConfigBarProps) {
  const size = value.size;

  return (
    <div className={styles.buttonBar}>
      <button
        className={`${styles.button} ${size === 3 ? styles.selected : ''}`}
        onClick={() => onChange({ size: 3 })}
      >
        3×3
      </button>
      <button
        className={`${styles.button} ${size === 5 ? styles.selected : ''}`}
        onClick={() => onChange({ size: 5 })}
      >
        5×5
      </button>
      <button
        className={`${styles.button} ${size === 7 ? styles.selected : ''}`}
        onClick={() => onChange({ size: 7 })}
      >
        7×7
      </button>
    </div>
  );
}
