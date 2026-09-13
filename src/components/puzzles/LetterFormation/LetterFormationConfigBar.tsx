import type { LetterFormationConfig } from './index';
import { LETTER_FORMS } from './letterForms';
import styles from './LetterFormationConfigBar.module.css';

interface ConfigBarProps {
  value: LetterFormationConfig;
  onChange: (config: LetterFormationConfig) => void;
}

export default function LetterFormationConfigBar({ value, onChange }: ConfigBarProps) {
  const { letter, guides, traceCount } = value;

  return (
    <div className={styles.configContainer}>
      <div className={styles.configGroup}>
        <span className={styles.label}>Letter:</span>
        <div className={styles.letterGrid}>
          <button
            type="button"
            className={`${styles.letterButton} ${letter === '' ? styles.selected : ''}`}
            onClick={() => onChange({ ...value, letter: '' })}
            title="Pick one at random - reroll for a different letter"
          >
            ?
          </button>
          {LETTER_FORMS.map(form => (
            <button
              key={form.char}
              type="button"
              className={`${styles.letterButton} ${letter === form.char ? styles.selected : ''}`}
              onClick={() => onChange({ ...value, letter: form.char })}
            >
              {form.char}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.configGroup}>
        <span className={styles.label}>Trace:</span>
        <div className={styles.buttonBar}>
          {([1, 2, 3] as const).map(n => (
            <button
              key={n}
              type="button"
              className={`${styles.button} ${traceCount === n ? styles.selected : ''}`}
              onClick={() => onChange({ ...value, traceCount: n })}
              title={`${n} grey letter${n === 1 ? '' : 's'} to write over on each line`}
            >
              {n}
            </button>
          ))}
        </div>

        <button
          type="button"
          className={`${styles.toggleButton} ${guides ? styles.selected : ''}`}
          onClick={() => onChange({ ...value, guides: !guides })}
          title="Numbered starting points and direction arrows on the model letter"
        >
          1→
        </button>
      </div>
    </div>
  );
}
