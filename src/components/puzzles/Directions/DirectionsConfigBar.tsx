import type { DirectionsConfig } from './index';
import styles from './DirectionsConfigBar.module.css';

interface DirectionsConfigBarProps {
  value: DirectionsConfig;
  onChange: (config: DirectionsConfig) => void;
}

interface Option<K extends keyof DirectionsConfig> {
  value: DirectionsConfig[K];
  label: string;
  tooltip?: string;
}

const GROUPS: { [K in keyof DirectionsConfig]?: { label: string; options: Option<K>[] } } = {
  mode: {
    label: 'Task:',
    options: [
      { value: 'follow', label: 'Follow', tooltip: 'Follow the route and mark where it ends' },
      { value: 'write', label: 'Write', tooltip: 'Write the route from start to goal' },
      { value: 'fix', label: 'Fix', tooltip: 'Find the one wrong step in the route' },
    ],
  },
  notation: {
    label: 'Steps:',
    options: [
      { value: 'arrows', label: '→ →', tooltip: 'One arrow per square' },
      { value: 'counts', label: '2 →', tooltip: 'A number and an arrow per straight line' },
      { value: 'words', label: '2 right', tooltip: 'Written directions' },
    ],
  },
  theme: {
    label: 'Theme:',
    options: [
      { value: 'robot', label: '🤖 Robot' },
      { value: 'treasure', label: '❌ Treasure' },
    ],
  },
  length: {
    label: 'Length:',
    options: [
      { value: 'short', label: 'Short', tooltip: 'Two straight lines' },
      { value: 'medium', label: 'Medium', tooltip: 'Three straight lines' },
      { value: 'long', label: 'Long', tooltip: 'Five straight lines' },
    ],
  },
  spareBoxes: {
    label: 'Boxes:',
    options: [
      { value: false, label: 'Exact', tooltip: 'Just enough boxes for the shortest route' },
      { value: true, label: 'Spare', tooltip: 'A few more boxes than needed, so the count gives less away' },
    ],
  },
};

function ButtonGroup<K extends keyof DirectionsConfig>({
  name,
  value,
  onChange,
}: DirectionsConfigBarProps & { name: K }) {
  const group = GROUPS[name]!;
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

export default function DirectionsConfigBar({ value, onChange }: DirectionsConfigBarProps) {
  const props = { value, onChange };
  return (
    <div className={styles.configContainer}>
      <ButtonGroup name="mode" {...props} />
      <ButtonGroup name="notation" {...props} />
      <ButtonGroup name="theme" {...props} />
      <ButtonGroup name="length" {...props} />
      {value.mode === 'write' && <ButtonGroup name="spareBoxes" {...props} />}
    </div>
  );
}
