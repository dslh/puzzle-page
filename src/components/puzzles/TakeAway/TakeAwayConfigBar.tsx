import type { TakeAwayConfig } from './index';
import type { BlankMode } from './generator';
import styles from './TakeAwayConfigBar.module.css';

interface TakeAwayConfigBarProps {
  value: TakeAwayConfig;
  onChange: (config: TakeAwayConfig) => void;
}

const BLANKS: Array<{ blankMode: BlankMode; label: string; tooltip: string }> = [
  { blankMode: 'answer', label: '7−4=▢', tooltip: 'Write how many are left' },
  { blankMode: 'taken', label: '7−▢=3', tooltip: 'Write how many were taken away' },
  { blankMode: 'mixed', label: 'Mix', tooltip: 'A mix of both, row by row' },
];

export default function TakeAwayConfigBar({ value, onChange }: TakeAwayConfigBarProps) {
  const blankMode = value.blankMode ?? 'answer';
  const workedExample = value.workedExample ?? true;

  return (
    <div className={styles.configContainer}>
      <div className={styles.configGroup}>
        <span className={styles.label}>Blank:</span>
        <div className={styles.buttonBar}>
          {BLANKS.map(({ blankMode: mode, label, tooltip }) => (
            <button
              key={mode}
              type="button"
              className={`${styles.button} ${blankMode === mode ? styles.selected : ''}`}
              onClick={() => onChange({ ...value, blankMode: mode })}
              title={tooltip}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

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
