import type { ChessConfig } from './index';
import styles from './ChessConfigBar.module.css';

interface ChessConfigBarProps {
  value: ChessConfig;
  onChange: (config: ChessConfig) => void;
}

export default function ChessConfigBar({ value, onChange }: ChessConfigBarProps) {
  const difficulty = value.difficulty;

  return (
    <div className={styles.buttonBar}>
      <button
        type="button"
        className={`${styles.button} ${difficulty === 'easy' ? styles.selected : ''}`}
        onClick={() => onChange({ ...value, difficulty: 'easy' })}
        title="Rating < 450"
      >
        Easy
      </button>
      <button
        type="button"
        className={`${styles.button} ${difficulty === 'medium' ? styles.selected : ''}`}
        onClick={() => onChange({ ...value, difficulty: 'medium' })}
        title="Rating 450-550"
      >
        Medium
      </button>
      <button
        type="button"
        className={`${styles.button} ${difficulty === 'hard' ? styles.selected : ''}`}
        onClick={() => onChange({ ...value, difficulty: 'hard' })}
        title="Rating 550-700"
      >
        Hard
      </button>
    </div>
  );
}
