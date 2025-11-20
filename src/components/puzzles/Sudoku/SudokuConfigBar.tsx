import styles from './SudokuConfigBar.module.css';

interface SudokuConfigBarProps {
  value: 3 | 4;
  onChange: (size: 3 | 4) => void;
}

export default function SudokuConfigBar({ value, onChange }: SudokuConfigBarProps) {
  return (
    <div className={styles.buttonBar}>
      <button
        type="button"
        className={`${styles.button} ${value === 3 ? styles.selected : ''}`}
        onClick={() => onChange(3)}
      >
        3×3
      </button>
      <button
        type="button"
        className={`${styles.button} ${value === 4 ? styles.selected : ''}`}
        onClick={() => onChange(4)}
      >
        4×4
      </button>
    </div>
  );
}
