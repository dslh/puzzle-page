import type { MazeConfig } from './index';
import styles from './MazeConfigBar.module.css';

interface MazeConfigBarProps {
  value: MazeConfig;
  onChange: (config: MazeConfig) => void;
}

export default function MazeConfigBar({ value, onChange }: MazeConfigBarProps) {
  const ratio = value.cellSizeRatio;
  const branchiness = value.branchiness;

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
          className={`${styles.button} ${branchiness === 'low' ? styles.selected : ''}`}
          onClick={() => onChange({ ...value, branchiness: 'low' })}
          title="Long corridors, few branches"
        >
          Windy
        </button>
        <button
          type="button"
          className={`${styles.button} ${branchiness === 'medium' ? styles.selected : ''}`}
          onClick={() => onChange({ ...value, branchiness: 'medium' })}
          title="Balanced corridors and branches"
        >
          Mixed
        </button>
        <button
          type="button"
          className={`${styles.button} ${branchiness === 'high' ? styles.selected : ''}`}
          onClick={() => onChange({ ...value, branchiness: 'high' })}
          title="Many branches, shorter corridors"
        >
          Branchy
        </button>
      </div>
    </div>
  );
}
