import { missingLetters, parseCustomWords, type KeyMode } from './generator';
import type { LetterCase, SecretCodeConfig } from './index';
import styles from './SecretCodeConfigBar.module.css';

interface ConfigBarProps {
  value: SecretCodeConfig;
  onChange: (config: SecretCodeConfig) => void;
}

const MODES: Array<{ mode: KeyMode; label: string; tooltip: string }> = [
  { mode: 'cipher', label: 'Code', tooltip: 'Any picture can stand for any letter, so the key is needed' },
  { mode: 'phonics', label: 'Sounds', tooltip: 'Each picture starts with its letter (easier)' },
];

const CASES: Array<{ letterCase: LetterCase; label: string; tooltip: string }> = [
  { letterCase: 'upper', label: 'ABC', tooltip: 'Uppercase' },
  { letterCase: 'lower', label: 'abc', tooltip: 'Lowercase' },
];

export default function SecretCodeConfigBar({ value, onChange }: ConfigBarProps) {
  const customWordsText = value.customWordsText ?? '';

  // A sounds key has no picture for some letters (Q, X, ...), so a word using
  // one can't be spelled. Say which, rather than leaving it out silently.
  const unspellable = parseCustomWords(customWordsText).filter(
    (w) => missingLetters(w, value.mode).length > 0
  );
  const missing = [...new Set(unspellable.flatMap((w) => missingLetters(w, value.mode)))].sort();

  return (
    <div className={styles.configContainer}>
      <div className={styles.configGroup}>
        <span className={styles.label}>Key:</span>
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
        <span className={styles.label}>Decoys:</span>
        <div className={styles.buttonBar}>
          <button
            type="button"
            className={`${styles.button} ${!value.decoys ? styles.selected : ''}`}
            onClick={() => onChange({ ...value, decoys: false })}
            title="The key only has the letters the words use"
          >
            Off
          </button>
          <button
            type="button"
            className={`${styles.button} ${value.decoys ? styles.selected : ''}`}
            onClick={() => onChange({ ...value, decoys: true })}
            title="Fill the key with extra letters no word uses"
          >
            On
          </button>
        </div>
      </div>

      <div className={styles.configGroup}>
        <span className={styles.label}>Words:</span>
        <input
          type="text"
          className={styles.textInput}
          placeholder="custom words (optional)"
          title="Words to decode, used before any from the word list"
          value={customWordsText}
          onChange={(e) => onChange({ ...value, customWordsText: e.target.value })}
        />
      </div>

      {unspellable.length > 0 && (
        <div className={styles.warning}>
          No Sounds picture for {missing.join(', ')}, so skipping {unspellable.join(', ')}
        </div>
      )}
    </div>
  );
}
