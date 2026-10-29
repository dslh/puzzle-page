import type { WhoGoesWhereConfig } from './index';
import styles from './WhoGoesWhereConfigBar.module.css';

interface WhoGoesWhereConfigBarProps {
  value: WhoGoesWhereConfig;
  onChange: (config: WhoGoesWhereConfig) => void;
}

interface Option<K extends keyof WhoGoesWhereConfig> {
  value: WhoGoesWhereConfig[K];
  label: string;
  tooltip?: string;
}

const GROUPS: { [K in keyof WhoGoesWhereConfig]: { label: string; options: Option<K>[] } } = {
  level: {
    label: 'Level:',
    options: [
      { value: 'easy', label: 'Easy', tooltip: 'Clues mostly say where an animal lives' },
      { value: 'medium', label: 'Medium', tooltip: 'Clues say where an animal does not live' },
      { value: 'hard', label: 'Hard', tooltip: 'Adds a clue about who lives next door' },
    ],
  },
  houses: {
    label: 'Houses:',
    options: [
      { value: 3, label: '3' },
      { value: 4, label: '4' },
    ],
  },
  clues: {
    label: 'Clues:',
    options: [
      { value: 'pictures', label: 'Pictures' },
      { value: 'words', label: 'Words', tooltip: 'Sentences to read' },
    ],
  },
};

function ButtonGroup<K extends keyof WhoGoesWhereConfig>({
  name,
  value,
  onChange,
}: WhoGoesWhereConfigBarProps & { name: K }) {
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

export default function WhoGoesWhereConfigBar({ value, onChange }: WhoGoesWhereConfigBarProps) {
  const props = { value, onChange };
  return (
    <div className={styles.configContainer}>
      <ButtonGroup name="level" {...props} />
      <ButtonGroup name="houses" {...props} />
      <ButtonGroup name="clues" {...props} />
    </div>
  );
}
