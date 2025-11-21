import type { MazeConfig } from './index';
import styles from './MazeConfigBar.module.css';

interface MazeConfigBarProps {
  value: MazeConfig;
  onChange: (config: MazeConfig) => void;
}

export default function MazeConfigBar({ value, onChange }: MazeConfigBarProps) {
  const ratio = value.cellSizeRatio;

  return (
    <div className={styles.buttonBar}>
      <button
        type="button"
        className={`${styles.button} ${ratio === 2 ? styles.selected : ''}`}
        onClick={() => onChange({ cellSizeRatio: 2 })}
        title="Larger cells (easier)"
      >
        Large
      </button>
      <button
        type="button"
        className={`${styles.button} ${ratio === 3 ? styles.selected : ''}`}
        onClick={() => onChange({ cellSizeRatio: 3 })}
        title="Medium cells"
      >
        Medium
      </button>
      <button
        type="button"
        className={`${styles.button} ${ratio === 4 ? styles.selected : ''}`}
        onClick={() => onChange({ cellSizeRatio: 4 })}
        title="Smaller cells (harder)"
      >
        Small
      </button>
    </div>
  );
}
