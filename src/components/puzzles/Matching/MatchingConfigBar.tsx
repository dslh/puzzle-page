import { couldBeWord, resolveCustomWords } from './generator';
import type { MatchingConfig } from './index';
import styles from './MatchingConfigBar.module.css';

interface ConfigBarProps {
  value: MatchingConfig;
  onChange: (config: MatchingConfig) => void;
}

export default function MatchingConfigBar({ value, onChange }: ConfigBarProps) {
  const { mode, maxWordLength } = value;
  const customWordsText = value.customWordsText ?? '';

  // Every pair needs a picture, so a word we have no emoji for cannot be used.
  // Name the rejects instead of dropping them silently - otherwise a typo just
  // looks like the field being ignored.
  const { unmatched } = resolveCustomWords(customWordsText);

  // The word still under the cursor isn't a mistake yet if it could grow into a
  // real one. Suppressing it keeps the warning from flashing on every keystroke
  // (and the panel from resizing under the mouse) while someone types DOG.
  const trailing = /[,\s]$/.test(customWordsText)
    ? ''
    : (customWordsText.toUpperCase().split(/[,\s]+/).pop() ?? '').replace(
        /[^A-Z]/g,
        ''
      );
  const rejected = unmatched.filter(
    word => word !== trailing || !couldBeWord(trailing)
  );

  return (
    <div className={styles.configContainer}>
      <div className={styles.configGroup}>
        <span className={styles.label}>Match:</span>
        <div className={styles.buttonBar}>
          <button
            type="button"
            className={`${styles.button} ${mode === 'silhouette' ? styles.selected : ''}`}
            onClick={() => onChange({ ...value, mode: 'silhouette' })}
            title="Match each picture to its silhouette"
          >
            Pictures
          </button>
          <button
            type="button"
            className={`${styles.button} ${mode === 'word' ? styles.selected : ''}`}
            onClick={() => onChange({ ...value, mode: 'word' })}
            title="Read each word and match it to the right picture"
          >
            Words
          </button>
        </div>
      </div>

      {/* Only meaningful in word mode, so don't clutter the bar otherwise */}
      {mode === 'word' && (
        <div className={styles.configGroup}>
          <span className={styles.label}>Letters:</span>
          <div className={styles.buttonBar}>
            {([3, 4, 5] as const).map((n) => (
              <button
                key={n}
                type="button"
                className={`${styles.button} ${maxWordLength === n ? styles.selected : ''}`}
                onClick={() => onChange({ ...value, maxWordLength: n })}
                title={`Words of up to ${n} letters`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}

      {mode === 'word' && (
        <div className={styles.configGroup}>
          <span className={styles.label}>Custom:</span>
          <input
            type="text"
            className={styles.textInput}
            placeholder="CAT, DOG, FISH..."
            title="Only words that have a picture can be used here"
            value={customWordsText}
            onChange={(e) =>
              onChange({ ...value, customWordsText: e.target.value })
            }
          />
        </div>
      )}

      {mode === 'word' && rejected.length > 0 && (
        <div className={styles.warning}>
          No picture for {rejected.join(', ')}
        </div>
      )}
    </div>
  );
}
