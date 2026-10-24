import type { MissingNumbersConfig } from './index';
import styles from './MissingNumbersConfigBar.module.css';

interface MissingNumbersConfigBarProps {
  value: MissingNumbersConfig;
  onChange: (config: MissingNumbersConfig) => void;
}

interface Option<K extends keyof MissingNumbersConfig> {
  value: MissingNumbersConfig[K];
  label: string;
  tooltip?: string;
}

const GROUPS: { [K in keyof MissingNumbersConfig]: { label: string; options: Option<K>[] } } = {
  layout: {
    label: 'Layout:',
    options: [
      { value: 'track', label: 'Track', tooltip: 'Rows of boxes counting along, like 4 5 _ 7' },
      { value: 'square', label: '100 square', tooltip: 'Part of a 100 square: one more across, ten more down' },
    ],
  },
  range: {
    label: 'Up to:',
    options: [
      { value: 20, label: '20' },
      { value: 50, label: '50' },
      { value: 100, label: '100' },
    ],
  },
  step: {
    label: 'Count in:',
    options: [
      { value: 1, label: '1s' },
      { value: 2, label: '2s' },
      { value: 5, label: '5s' },
      { value: 10, label: '10s' },
    ],
  },
  direction: {
    label: 'Count:',
    options: [
      { value: 'forwards', label: 'Forwards' },
      { value: 'backwards', label: 'Backwards' },
    ],
  },
  gaps: {
    label: 'Gaps:',
    options: [
      { value: 'few', label: 'Few' },
      { value: 'some', label: 'Some' },
      { value: 'lots', label: 'Lots' },
    ],
  },
};

function ButtonGroup<K extends keyof MissingNumbersConfig>({
  name,
  value,
  onChange,
}: MissingNumbersConfigBarProps & { name: K }) {
  const group = GROUPS[name];
  return (
    <div className={styles.configGroup}>
      <span className={styles.label}>{group.label}</span>
      <div className={styles.buttonBar}>
        {group.options.map(option => (
          <button
            key={String(option.value)}
            type="button"
            className={`${styles.button} ${value[name] === option.value ? styles.selected : ''}`}
            onClick={() => onChange({ ...value, [name]: option.value })}
            title={option.tooltip}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function MissingNumbersConfigBar({ value, onChange }: MissingNumbersConfigBarProps) {
  const props = { value, onChange };
  return (
    <div className={styles.configContainer}>
      <ButtonGroup name="layout" {...props} />
      <ButtonGroup name="range" {...props} />
      {/* The 100 square always counts in 1s across and 10s down */}
      {value.layout === 'track' && <ButtonGroup name="step" {...props} />}
      {value.layout === 'track' && <ButtonGroup name="direction" {...props} />}
      <ButtonGroup name="gaps" {...props} />
    </div>
  );
}
