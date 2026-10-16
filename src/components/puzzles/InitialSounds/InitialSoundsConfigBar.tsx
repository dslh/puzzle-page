import type { InitialSoundsConfig, InitialSoundsMode, LetterCase } from './index';
import styles from './InitialSoundsConfigBar.module.css';

interface ConfigBarProps {
  value: InitialSoundsConfig;
  onChange: (config: InitialSoundsConfig) => void;
}

const MODES: Array<{ mode: InitialSoundsMode; label: string; tooltip: string }> = [
  { mode: 'circle', label: 'Circle', tooltip: 'Circle the first letter from three choices' },
  { mode: 'write', label: 'Write', tooltip: 'Write the first letter in the box (harder)' },
];

const CASES: Array<{ letterCase: LetterCase; label: string; tooltip: string }> = [
  { letterCase: 'lower', label: 'abc', tooltip: 'Lowercase' },
  { letterCase: 'upper', label: 'ABC', tooltip: 'Uppercase' },
];

export default function InitialSoundsConfigBar({ value, onChange }: ConfigBarProps) {
  return (
    <div className={styles.configContainer}>
      <div className={styles.configGroup}>
        <span className={styles.label}>Task:</span>
        <div className={styles.buttonBar}>
          {MODES.map(({ mode, label, tooltip }) => (
            <button
              key={mode}
              type="button"
              className={`${styles.button} ${value.mode === mode ? styles.selected : ''}`}
              onClick={() => onChange({ ...value, mode })}
              title={tooltip}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.configGroup}>
        <span className={styles.label}>Case:</span>
        <div className={styles.buttonBar}>
          {CASES.map(({ letterCase, label, tooltip }) => (
            <button
              key={letterCase}
              type="button"
              className={`${styles.button} ${value.letterCase === letterCase ? styles.selected : ''}`}
              onClick={() => onChange({ ...value, letterCase })}
              title={tooltip}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.configGroup}>
        <span className={styles.label}>Letters:</span>
        <input
          type="text"
          className={styles.textInput}
          placeholder="all (or e.g. s a t p i n)"
          title="Only use pictures starting with these letters"
          value={value.lettersText ?? ''}
          onChange={(e) => onChange({ ...value, lettersText: e.target.value })}
        />
      </div>
    </div>
  );
}
