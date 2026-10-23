import type { OddOneOutConfig } from './index';
import type { OddOneOutMode } from './generator';
import styles from './OddOneOutConfigBar.module.css';

interface OddOneOutConfigBarProps {
  value: OddOneOutConfig;
  onChange: (config: OddOneOutConfig) => void;
}

const MODES: Array<{ mode: OddOneOutMode; label: string; tooltip: string }> = [
  { mode: 'odd', label: 'Odd one out', tooltip: 'Every picture has a twin, except one' },
  { mode: 'pair', label: 'Pair', tooltip: 'Every picture is different, except two' },
];

const SIZES: Array<OddOneOutConfig['size']> = [3, 5, 7];

export default function OddOneOutConfigBar({ value, onChange }: OddOneOutConfigBarProps) {
  const mode = value.mode ?? 'odd';
  const size = value.size;

  return (
    <div className={styles.configContainer}>
      <div className={styles.configGroup}>
        <span className={styles.label}>Find:</span>
        <div className={styles.buttonBar}>
          {MODES.map(m => (
            <button
              key={m.mode}
              type="button"
              className={`${styles.button} ${mode === m.mode ? styles.selected : ''}`}
              onClick={() => onChange({ ...value, mode: m.mode })}
              title={m.tooltip}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.configGroup}>
        <span className={styles.label}>Grid:</span>
        <div className={styles.buttonBar}>
          {SIZES.map(s => (
            <button
              key={s}
              type="button"
              className={`${styles.button} ${size === s ? styles.selected : ''}`}
              onClick={() => onChange({ ...value, size: s })}
            >
              {s}×{s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
