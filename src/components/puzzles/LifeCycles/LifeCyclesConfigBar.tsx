import type { LifeCyclesConfig } from './index';
import { CYCLES, CYCLE_IDS } from './cycles';
import type { LifeCyclesChoice } from './generator';
import styles from './LifeCyclesConfigBar.module.css';

interface LifeCyclesConfigBarProps {
  value: LifeCyclesConfig;
  onChange: (config: LifeCyclesConfig) => void;
}

interface Option<T> {
  value: T;
  label: string;
  tooltip: string;
}

const TASKS: Option<LifeCyclesConfig['task']>[] = [
  { value: 'number', label: 'Number', tooltip: 'The stages are jumbled; write 1, 2, 3 under them in order' },
  { value: 'missing', label: 'Missing', tooltip: 'The cycle goes round a circle with one stage left blank to draw' },
];

const FIRST: Option<boolean>[] = [
  { value: true, label: 'Shown', tooltip: 'The first stage is already numbered 1' },
  { value: false, label: 'Blank', tooltip: 'They decide where the cycle starts' },
];

export default function LifeCyclesConfigBar({ value, onChange }: LifeCyclesConfigBarProps) {
  return (
    <div className={styles.configContainer}>
      <div className={styles.configGroup}>
        <span className={styles.label}>Task:</span>
        <div className={styles.buttonBar}>
          {TASKS.map(option => (
            <button
              key={option.value}
              type="button"
              className={`${styles.button} ${value.task === option.value ? styles.selected : ''}`}
              onClick={() => onChange({ ...value, task: option.value })}
              title={option.tooltip}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.configGroup}>
        <span className={styles.label}>Cycle:</span>
        <select
          className={styles.select}
          value={value.cycle}
          onChange={e => onChange({ ...value, cycle: e.target.value as LifeCyclesChoice })}
        >
          <option value="mixed">Mixed</option>
          {CYCLE_IDS.map(id => <option key={id} value={id}>{CYCLES[id].label}</option>)}
        </select>
      </div>
      {/* The circle has no numbers to start from */}
      {value.task === 'number' && (
        <div className={styles.configGroup}>
          <span className={styles.label}>First:</span>
          <div className={styles.buttonBar}>
            {FIRST.map(option => (
              <button
                key={option.label}
                type="button"
                className={`${styles.button} ${value.firstShown === option.value ? styles.selected : ''}`}
                onClick={() => onChange({ ...value, firstShown: option.value })}
                title={option.tooltip}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
