import type { LetterFormationConfig } from './index';
import { LETTER_FORMS, NUMBER_FORMS } from './letterForms';
import styles from './LetterFormationConfigBar.module.css';

interface ConfigBarProps {
  value: LetterFormationConfig;
  onChange: (config: LetterFormationConfig) => void;
}

export default function LetterFormationConfigBar({ value, onChange }: ConfigBarProps) {
  const { letter, guides, traceCount } = value;
  const set = value.set ?? 'letters';
  const forms = set === 'numbers' ? NUMBER_FORMS : LETTER_FORMS;
  const noun = set === 'numbers' ? 'number' : 'letter';

  return (
    <div className={styles.configContainer}>
      <div className={styles.configGroup}>
        <span className={styles.label}>Write:</span>
        <div className={styles.buttonBar}>
          {(['letters', 'numbers'] as const).map(s => (
            <button
              key={s}
              type="button"
              className={`${styles.button} ${set === s ? styles.selected : ''}`}
              // The chosen character belongs to the old set, so fall back to random
              onClick={() => set !== s && onChange({ ...value, set: s, letter: '' })}
            >
              {s === 'letters' ? 'ABC' : '123'}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.configGroup}>
        <span className={styles.label}>{set === 'numbers' ? 'Number:' : 'Letter:'}</span>
        <div className={styles.letterGrid}>
          <button
            type="button"
            className={`${styles.letterButton} ${letter === '' ? styles.selected : ''}`}
            onClick={() => onChange({ ...value, letter: '' })}
            title={`Pick one at random - reroll for a different ${noun}`}
          >
            ?
          </button>
          {forms.map(form => (
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
              title={`${n} grey ${noun}${n === 1 ? '' : 's'} to write over on each line`}
            >
              {n}
            </button>
          ))}
        </div>

        <button
          type="button"
          className={`${styles.toggleButton} ${guides ? styles.selected : ''}`}
          onClick={() => onChange({ ...value, guides: !guides })}
          title={`Numbered starting points and direction arrows on the model ${noun}`}
        >
          1→
        </button>
      </div>
    </div>
  );
}
