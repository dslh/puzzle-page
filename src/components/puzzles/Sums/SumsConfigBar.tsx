import type { SumsConfig } from './index';
import styles from './SumsConfigBar.module.css';

interface SumsConfigBarProps {
  value: SumsConfig;
  onChange: (config: SumsConfig) => void;
}

export default function SumsConfigBar({ value, onChange }: SumsConfigBarProps) {
  const mode = value.mode ?? 'both';

  return (
    <div className={styles.buttonBar}>
      <button
        type="button"
        className={`${styles.button} ${mode === 'add' ? styles.selected : ''}`}
        onClick={() => onChange({ ...value, mode: 'add' })}
      >
        +
      </button>
      <button
        type="button"
        className={`${styles.button} ${mode === 'subtract' ? styles.selected : ''}`}
        onClick={() => onChange({ ...value, mode: 'subtract' })}
      >
        −
      </button>
      <button
        type="button"
        className={`${styles.button} ${mode === 'both' ? styles.selected : ''}`}
        onClick={() => onChange({ ...value, mode: 'both' })}
      >
        Both
      </button>
    </div>
  );
}
