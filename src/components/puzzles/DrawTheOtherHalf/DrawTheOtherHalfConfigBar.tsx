import type { DrawTheOtherHalfConfig } from './index';
import { PICTURES } from './pictures';
import styles from './DrawTheOtherHalfConfigBar.module.css';

interface ConfigBarProps {
  value: DrawTheOtherHalfConfig;
  onChange: (config: DrawTheOtherHalfConfig) => void;
}

const SUBJECTS = [
  { id: 'shape', label: 'Shape', title: 'A new made-up shape every time' },
  { id: 'picture', label: 'Picture', title: 'A house, a rocket, a cat and more' },
] as const;

const LEVELS = [
  { id: 'easy', label: 'Easy', title: 'Straight lines only' },
  { id: 'medium', label: 'Medium', title: 'More lines, some slanting' },
  { id: 'hard', label: 'Hard', title: 'Lots of lines, more slanting, some steep' },
] as const;

const HELP = [
  { id: 'dotted', label: 'Dotted', title: 'The missing half as dots to trace' },
  { id: 'corners', label: 'Corners', title: 'A big dot at each corner of the missing half' },
  { id: 'none', label: 'None', title: 'Just the grid' },
] as const;

const MIRRORS = [
  { id: 'vertical', label: 'Down', title: 'Mirror line down the middle: draw on the right' },
  { id: 'horizontal', label: 'Across', title: 'Mirror line across the middle: draw underneath' },
] as const;

export default function DrawTheOtherHalfConfigBar({ value, onChange }: ConfigBarProps) {
  const groups = [
    { label: 'Draw:', key: 'subject', options: SUBJECTS },
    { label: 'Level:', key: 'level', options: LEVELS },
    { label: 'Help:', key: 'help', options: HELP },
    { label: 'Mirror:', key: 'mirror', options: MIRRORS },
  ] as const;

  return (
    <div className={styles.configContainer}>
      {groups.map(group => (
        <div key={group.key} className={styles.configGroup}>
          <span className={styles.label}>{group.label}</span>
          <div className={styles.buttonBar}>
            {group.options.map(option => (
              <button
                key={option.id}
                type="button"
                className={`${styles.button} ${value[group.key] === option.id ? styles.selected : ''}`}
                onClick={() => onChange({ ...value, [group.key]: option.id })}
                title={option.title}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      ))}

      {value.subject === 'picture' && (
        <div className={styles.configGroup}>
          <span className={styles.label}>Picture:</span>
          <select
            className={styles.select}
            value={value.picture}
            onChange={e => onChange({ ...value, picture: e.target.value })}
            title="Which picture. Random picks one to suit the level"
          >
            <option value="random">Random</option>
            {LEVELS.map(level => (
              <optgroup key={level.id} label={level.label}>
                {PICTURES.filter(p => p.level === level.id).map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
