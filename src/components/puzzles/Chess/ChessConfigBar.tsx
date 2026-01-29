import type { ChessConfig } from './index';
import type { PuzzleMode } from './generator';
import styles from './ChessConfigBar.module.css';

interface ChessConfigBarProps {
  value: ChessConfig;
  onChange: (config: ChessConfig) => void;
}

const MODES: { key: PuzzleMode; label: string }[] = [
  { key: 'mate', label: 'Mate' },
  { key: 'capture', label: 'Capture' },
  { key: 'both', label: 'Both' },
];

export default function ChessConfigBar({ value, onChange }: ChessConfigBarProps) {
  const difficulty = value.difficulty;
  const mode = value.mode ?? 'mate';

  return (
    <div className={styles.container}>
      <div className={styles.buttonBar}>
        {MODES.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={`${styles.button} ${mode === key ? styles.selected : ''}`}
            onClick={() => onChange({ ...value, mode: key })}
          >
            {label}
          </button>
        ))}
      </div>
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
    </div>
  );
}
