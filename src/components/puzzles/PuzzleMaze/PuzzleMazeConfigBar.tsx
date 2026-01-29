import type { PuzzleMazeConfig } from './index';
import styles from './PuzzleMazeConfigBar.module.css';

interface PuzzleMazeConfigBarProps {
  value: PuzzleMazeConfig;
  onChange: (config: PuzzleMazeConfig) => void;
}

export default function PuzzleMazeConfigBar({ value, onChange }: PuzzleMazeConfigBarProps) {
  const mode = value.emojiMode;

  return (
    <div className={styles.buttonBar}>
      <button
        type="button"
        className={`${styles.button} ${mode === 'circles' ? styles.selected : ''}`}
        onClick={() => onChange({ ...value, emojiMode: 'circles' })}
        title="Use colored circle emojis"
      >
        Circles
      </button>
      <button
        type="button"
        className={`${styles.button} ${mode === 'random' ? styles.selected : ''}`}
        onClick={() => onChange({ ...value, emojiMode: 'random' })}
        title="Use a random emoji theme"
      >
        Random
      </button>
    </div>
  );
}
