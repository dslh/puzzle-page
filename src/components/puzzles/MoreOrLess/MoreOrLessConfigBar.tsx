import type { MoreOrLessConfig } from './index';
import type { LayoutMode } from './generator';
import styles from './MoreOrLessConfigBar.module.css';

interface MoreOrLessConfigBarProps {
  value: MoreOrLessConfig;
  onChange: (config: MoreOrLessConfig) => void;
}

const LAYOUTS: Array<{ layout: LayoutMode; label: string; tooltip: string }> = [
  { layout: 'mixed', label: 'Mix', tooltip: 'A different arrangement on each side' },
  { layout: 'scatter', label: 'Scatter', tooltip: 'Spread out at random' },
  { layout: 'rows', label: 'Rows', tooltip: 'Two lines with random gaps' },
  { layout: 'clusters', label: 'Clumps', tooltip: 'A few uneven huddles' },
];

export default function MoreOrLessConfigBar({ value, onChange }: MoreOrLessConfigBarProps) {
  const layout = value.layout ?? 'mixed';
  const workedExample = value.workedExample ?? true;

  return (
    <div className={styles.configContainer}>
      <div className={styles.configGroup}>
        <span className={styles.label}>Layout:</span>
        <div className={styles.buttonBar}>
          {LAYOUTS.map(({ layout: mode, label, tooltip }) => (
            <button
              key={mode}
              type="button"
              className={`${styles.button} ${layout === mode ? styles.selected : ''}`}
              onClick={() => onChange({ ...value, layout: mode })}
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
