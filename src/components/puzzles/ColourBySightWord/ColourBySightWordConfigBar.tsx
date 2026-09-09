import type { ColourBySightWordConfig, ColourCount, LetterCase } from './index';
import styles from './ColourBySightWordConfigBar.module.css';

interface ConfigBarProps {
  value: ColourBySightWordConfig;
  onChange: (config: ColourBySightWordConfig) => void;
}

const COLOUR_COUNTS: Array<{ count: ColourCount; tooltip: string }> = [
  { count: 2, tooltip: 'Two words, two colours (easiest)' },
  { count: 3, tooltip: 'Three words, three colours' },
  { count: 4, tooltip: 'Four words, four colours (hardest)' },
];

const CASES: Array<{ letterCase: LetterCase; label: string; tooltip: string }> = [
  { letterCase: 'lower', label: 'abc', tooltip: 'Lowercase, as words appear in books' },
  { letterCase: 'upper', label: 'ABC', tooltip: 'Capitals' },
];

export default function ColourBySightWordConfigBar({ value, onChange }: ConfigBarProps) {
  return (
    <div className={styles.configContainer}>
      <div className={styles.configGroup}>
        <span className={styles.label}>Colours:</span>
        <div className={styles.buttonBar}>
          {COLOUR_COUNTS.map(({ count, tooltip }) => (
            <button
              key={count}
              type="button"
              className={`${styles.button} ${value.colourCount === count ? styles.selected : ''}`}
              onClick={() => onChange({ ...value, colourCount: count })}
              title={tooltip}
            >
              {count}
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
          placeholder="the, and, is..."
          value={value.customWordsText ?? ''}
          onChange={(e) => onChange({ ...value, customWordsText: e.target.value })}
        />
      </div>
    </div>
  );
}
