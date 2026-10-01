import type { MoreOrLessConfig } from './index';
import styles from './MoreOrLessConfigBar.module.css';

interface MoreOrLessConfigBarProps {
  value: MoreOrLessConfig;
  onChange: (config: MoreOrLessConfig) => void;
}

export default function MoreOrLessConfigBar({ value, onChange }: MoreOrLessConfigBarProps) {
  const workedExample = value.workedExample ?? true;

  return (
    <div className={styles.configContainer}>
      <div className={styles.configGroup}>
        <span className={styles.label}>Example:</span>
        <div className={styles.buttonBar}>
          <button
            type="button"
            className={`${styles.button} ${workedExample ? styles.selected : ''}`}
            onClick={() => onChange({ ...value, workedExample: true })}
            title="Complete the first row as a guide"
          >
            First row
          </button>
          <button
            type="button"
            className={`${styles.button} ${!workedExample ? styles.selected : ''}`}
            onClick={() => onChange({ ...value, workedExample: false })}
          >
            None
          </button>
        </div>
      </div>
    </div>
  );
}
