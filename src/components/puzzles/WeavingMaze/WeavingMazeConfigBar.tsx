import type { WeavingMazeConfig } from './index';
import styles from './WeavingMazeConfigBar.module.css';

interface WeavingMazeConfigBarProps {
  value: WeavingMazeConfig;
  onChange: (config: WeavingMazeConfig) => void;
}

export default function WeavingMazeConfigBar({
  value,
  onChange,
}: WeavingMazeConfigBarProps) {
  const ratio = value.cellSizeRatio;
  const density = value.crossingDensity;

  return (
    <div className={styles.configContainer}>
      <div className={styles.buttonBar}>
        <button
          type="button"
          className={`${styles.button} ${ratio === 2 ? styles.selected : ''}`}
          onClick={() => onChange({ ...value, cellSizeRatio: 2 })}
          title="Larger cells (easier)"
        >
          Large
        </button>
        <button
          type="button"
          className={`${styles.button} ${ratio === 3 ? styles.selected : ''}`}
          onClick={() => onChange({ ...value, cellSizeRatio: 3 })}
          title="Medium cells"
        >
          Medium
        </button>
        <button
          type="button"
          className={`${styles.button} ${ratio === 4 ? styles.selected : ''}`}
          onClick={() => onChange({ ...value, cellSizeRatio: 4 })}
          title="Smaller cells (harder)"
        >
          Small
        </button>
      </div>
      <div className={styles.buttonBar}>
        <button
          type="button"
          className={`${styles.button} ${density === 'few' ? styles.selected : ''}`}
          onClick={() => onChange({ ...value, crossingDensity: 'few' })}
          title="Fewer crossings (easier)"
        >
          Few
        </button>
        <button
          type="button"
          className={`${styles.button} ${density === 'medium' ? styles.selected : ''}`}
          onClick={() => onChange({ ...value, crossingDensity: 'medium' })}
          title="Some crossings"
        >
          Some
        </button>
        <button
          type="button"
          className={`${styles.button} ${density === 'many' ? styles.selected : ''}`}
          onClick={() => onChange({ ...value, crossingDensity: 'many' })}
          title="Many crossings (harder)"
        >
          Many
        </button>
      </div>
    </div>
  );
}
