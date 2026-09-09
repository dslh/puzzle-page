import type { MatchingConfig } from './index';
import styles from './MatchingConfigBar.module.css';

interface ConfigBarProps {
  value: MatchingConfig;
  onChange: (config: MatchingConfig) => void;
}

export default function MatchingConfigBar({ value, onChange }: ConfigBarProps) {
  const { mode, maxWordLength } = value;

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
    </div>
  );
}
