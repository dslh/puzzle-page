import type { HandwritingConfig, HandwritingMode, LetterCase } from './index';
import styles from './HandwritingConfigBar.module.css';

interface ConfigBarProps {
  value: HandwritingConfig;
  onChange: (config: HandwritingConfig) => void;
}

const MODES: Array<{ mode: HandwritingMode; label: string; tooltip: string }> = [
  { mode: 'trace', label: 'Trace', tooltip: 'Write over the grey letters (easiest)' },
  { mode: 'copy', label: 'Copy', tooltip: 'Copy the word onto the rest of the line' },
  { mode: 'missing', label: 'Missing', tooltip: 'Fill in the missing letter (hardest)' },
];

const CASES: Array<{ letterCase: LetterCase; label: string; tooltip: string }> = [
  { letterCase: 'lower', label: 'abc', tooltip: 'Lowercase' },
  { letterCase: 'upper', label: 'ABC', tooltip: 'Uppercase' },
];

export default function HandwritingConfigBar({ value, onChange }: ConfigBarProps) {
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
        <span className={styles.label}>Words:</span>
        <input
          type="text"
          className={styles.textInput}
          placeholder="cat, dog, fish..."
          value={value.customWordsText ?? ''}
          onChange={(e) => onChange({ ...value, customWordsText: e.target.value })}
        />
      </div>
    </div>
  );
}
