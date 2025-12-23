import type { WordSearchConfig } from './index';
import styles from './WordSearchConfigBar.module.css';

interface ConfigBarProps {
  value: WordSearchConfig;
  onChange: (config: WordSearchConfig) => void;
}

const DIFFICULTY_LABELS: Record<number, string> = {
  1: '→',
  2: '→↓',
  3: '→↓↘',
  4: '✱',
};

const DIFFICULTY_TOOLTIPS: Record<number, string> = {
  1: 'Horizontal only (easiest)',
  2: 'Horizontal + Vertical',
  3: '+ Diagonal',
  4: 'All directions (hardest)',
};

export default function WordSearchConfigBar({ value, onChange }: ConfigBarProps) {
  const { difficulty, wordCount, limitedLetters } = value;

  return (
    <div className={styles.configContainer}>
      <div className={styles.configGroup}>
        <span className={styles.label}>Directions:</span>
        <div className={styles.buttonBar}>
          {([1, 2, 3, 4] as const).map((level) => (
            <button
              key={level}
              type="button"
              className={`${styles.button} ${difficulty === level ? styles.selected : ''}`}
              onClick={() => onChange({ ...value, difficulty: level })}
              title={DIFFICULTY_TOOLTIPS[level]}
            >
              {DIFFICULTY_LABELS[level]}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.configGroup}>
        <span className={styles.label}>Words:</span>
        <div className={styles.buttonBar}>
          {([3, 4, 5] as const).map((count) => (
            <button
              key={count}
              type="button"
              className={`${styles.button} ${wordCount === count ? styles.selected : ''}`}
              onClick={() => onChange({ ...value, wordCount: count })}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.configGroup}>
        <button
          type="button"
          className={`${styles.toggleButton} ${limitedLetters ? styles.selected : ''}`}
          onClick={() => onChange({ ...value, limitedLetters: !limitedLetters })}
          title="Only use letters from the hidden words (harder)"
        >
          ABC
        </button>
      </div>
    </div>
  );
}
