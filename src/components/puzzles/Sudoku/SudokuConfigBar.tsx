import type { SudokuConfig } from './index';
import styles from './SudokuConfigBar.module.css';

interface SudokuConfigBarProps {
  value: SudokuConfig;
  onChange: (config: SudokuConfig) => void;
}

export default function SudokuConfigBar({ value, onChange }: SudokuConfigBarProps) {
  const size = value.size;

  return (
    <div className={styles.buttonBar}>
      <button
        type="button"
        className={`${styles.button} ${size === 3 ? styles.selected : ''}`}
        onClick={() => onChange({ size: 3 })}
      >
        3×3
      </button>
      <button
        type="button"
        className={`${styles.button} ${size === 4 ? styles.selected : ''}`}
        onClick={() => onChange({ size: 4 })}
      >
        4×4
      </button>
    </div>
  );
}
