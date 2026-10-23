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
  const workedExample = value.workedExample ?? true;

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
        <div className={`${styles.buttonBar} ${styles.gridBar}`}>
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
          <button
            type="button"
            className={`${styles.button} ${mode === 'letter' ? styles.selected : ''}`}
            onClick={() => onChange({ ...value, mode: 'letter' })}
            title="Match each upper case letter to its lower case partner"
          >
            Letters
          </button>
          <button
            type="button"
            className={`${styles.button} ${mode === 'rhyme' ? styles.selected : ''}`}
            onClick={() => onChange({ ...value, mode: 'rhyme' })}
            title="Match each picture to the one it rhymes with"
          >
            Rhymes
          </button>
          <button
            type="button"
            className={`${styles.button} ${mode === 'homes' ? styles.selected : ''}`}
            onClick={() => onChange({ ...value, mode: 'homes' })}
            title="Match each animal to where it lives"
          >
            Homes
          </button>
          <button
            type="button"
            className={`${styles.button} ${mode === 'halves' ? styles.selected : ''}`}
            onClick={() => onChange({ ...value, mode: 'halves' })}
            title="Join each half picture to its other half"
          >
            Halves
          </button>
        </div>
      </div>

      {mode === 'halves' && (
        <div className={styles.configGroup}>
          <span className={styles.label}>Pairs:</span>
          <div className={styles.buttonBar}>
            {(
              [
                [2, '2', 'Two big pairs'],
                [3, '3', 'Three big pairs'],
                ['rows', 'Fill', 'One pair a row'],
              ] as const
            ).map(([pairs, label, title]) => (
              <button
                key={pairs}
                type="button"
                className={`${styles.button} ${
                  (value.halvesPairs ?? 'rows') === pairs ? styles.selected : ''
                }`}
                onClick={() => onChange({ ...value, halvesPairs: pairs })}
                title={title}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {mode === 'halves' && (
        <div className={styles.configGroup}>
          <span className={styles.label}>Shapes:</span>
          <div className={styles.buttonBar}>
            <button
              type="button"
              className={`${styles.button} ${!value.distinctShapes ? styles.selected : ''}`}
              onClick={() => onChange({ ...value, distinctShapes: false })}
              title="Any pictures - some are told apart by colour"
            >
              Any
            </button>
            <button
              type="button"
              className={`${styles.button} ${value.distinctShapes ? styles.selected : ''}`}
              onClick={() => onChange({ ...value, distinctShapes: true })}
              title="Only pictures with different outlines - for black and white printing"
            >
              Different
            </button>
          </div>
        </div>
      )}

      {mode === 'rhyme' && (
        <div className={`${styles.configGroup} ${styles.stackedGroup}`}>
          <span className={styles.label}>Show:</span>
          <div className={styles.buttonBar}>
            {(
              [
                ['pictures', 'Pictures', 'Pictures only - say the words aloud'],
                ['words', 'Words', 'Words only - read them, then listen for the rhyme'],
                ['both', 'Both', 'Each picture with its word underneath'],
              ] as const
            ).map(([display, label, title]) => (
              <button
                key={display}
                type="button"
                className={`${styles.button} ${
                  (value.rhymeDisplay ?? 'pictures') === display ? styles.selected : ''
                }`}
                onClick={() => onChange({ ...value, rhymeDisplay: display })}
                title={title}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

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

      {mode === 'letter' && (
        <div className={styles.configGroup}>
          <span className={styles.label}>Letters:</span>
          <input
            type="text"
            className={styles.textInput}
            placeholder="Random, or e.g. s a t p"
            title="Only these letters are used. Leave empty for a random selection"
            value={value.customLettersText ?? ''}
            onChange={(e) =>
              onChange({ ...value, customLettersText: e.target.value })
            }
          />
        </div>
      )}

      <div className={styles.configGroup}>
        <span className={styles.label}>Example:</span>
        <div className={styles.buttonBar}>
          <button
            type="button"
            className={`${styles.button} ${workedExample ? styles.selected : ''}`}
            onClick={() => onChange({ ...value, workedExample: true })}
            title="Draw the first line as a dashed guide"
          >
            First pair
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

      {mode === 'word' && rejected.length > 0 && (
        <div className={styles.warning}>
          No picture for {rejected.join(', ')}
        </div>
      )}
    </div>
  );
}
