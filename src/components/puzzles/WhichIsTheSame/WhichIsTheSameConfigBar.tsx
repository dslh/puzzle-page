import type { WhichIsTheSameConfig } from './index';
import styles from './WhichIsTheSameConfigBar.module.css';

interface WhichIsTheSameConfigBarProps {
  value: WhichIsTheSameConfig;
  onChange: (config: WhichIsTheSameConfig) => void;
}

interface Option<K extends keyof WhichIsTheSameConfig> {
  value: WhichIsTheSameConfig[K];
  label: string;
  tooltip?: string;
}

const GROUPS: { [K in keyof WhichIsTheSameConfig]: { label: string; options: Option<K>[] } } = {
  difficulty: {
    label: 'Level:',
    options: [
      { value: 'easy', label: 'Easy', tooltip: 'The wrong pictures are other kinds of thing' },
      { value: 'medium', label: 'Medium', tooltip: 'The wrong pictures are the same kind of thing' },
      { value: 'hard', label: 'Hard', tooltip: 'The wrong pictures nearly match' },
      { value: 'mixed', label: 'Mixed', tooltip: 'Easy at the top, hard at the bottom' },
    ],
  },
  choices: {
    label: 'Choices:',
    options: [
      { value: 3, label: '3' },
      { value: 4, label: '4' },
      { value: 5, label: '5' },
    ],
  },
  flipped: {
    label: 'Flipped:',
    options: [
      { value: false, label: 'Off' },
      { value: true, label: 'On', tooltip: 'Adds the same picture facing the other way, so they look at which way it faces' },
    ],
  },
};

function ButtonGroup<K extends keyof WhichIsTheSameConfig>({
  name,
  value,
  onChange,
}: WhichIsTheSameConfigBarProps & { name: K }) {
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

export default function WhichIsTheSameConfigBar({ value, onChange }: WhichIsTheSameConfigBarProps) {
  const props = { value, onChange };
  return (
    <div className={styles.configContainer}>
      <ButtonGroup name="difficulty" {...props} />
      <ButtonGroup name="choices" {...props} />
      <ButtonGroup name="flipped" {...props} />
    </div>
  );
}
