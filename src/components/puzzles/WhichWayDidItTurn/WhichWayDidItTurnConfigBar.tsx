import type { TurnKind, ShapeStyle } from './generator';
import type { WhichWayDidItTurnConfig } from './index';
import styles from './WhichWayDidItTurnConfigBar.module.css';

interface WhichWayDidItTurnConfigBarProps {
  value: WhichWayDidItTurnConfig;
  onChange: (config: WhichWayDidItTurnConfig) => void;
}

export default function WhichWayDidItTurnConfigBar({ value, onChange }: WhichWayDidItTurnConfigBarProps) {
  const turns = value.turns ?? ['clockwise'];
  const shapes = value.shapes ?? 'blocks';
  const turnOptions: { id: TurnKind; label: string; name: string }[] = [
    { id: 'clockwise', label: '↻ ¼', name: 'Clockwise quarter-turns' },
    { id: 'anticlockwise', label: '↺ ¼', name: 'Anticlockwise quarter-turns' },
    { id: 'half', label: '½ turn', name: 'Half-turns' },
  ];
  const shapeOptions: { id: ShapeStyle; label: string }[] = [
    { id: 'blocks', label: 'Blocks' }, { id: 'pointy', label: 'Pointy' },
    { id: 'rounded', label: 'Rounded' }, { id: 'mixed', label: 'Mix' },
  ];
  const workedExample = value.workedExample ?? true;

  return (
    <div className={styles.configContainer}>
      <div className={styles.setting}>
        <span className={styles.label}>Turns (choose one or more):</span>
        <div className={styles.buttonBar}>
          {turnOptions.map(option => <button key={option.id} type="button"
            aria-label={option.name} aria-pressed={turns.includes(option.id)}
            title={option.name}
            className={`${styles.button} ${turns.includes(option.id) ? styles.selected : ''}`}
            onClick={() => {
              const next = turns.includes(option.id) ? turns.filter(t => t !== option.id) : [...turns, option.id];
              if (next.length) onChange({ ...value, turns: next });
            }}>{option.label}</button>)}
        </div>
      </div>
      <div className={styles.setting}>
        <span className={styles.label}>Shapes:</span>
        <div className={styles.buttonBar}>
          {shapeOptions.map(option => <button key={option.id} type="button" aria-pressed={shapes === option.id}
            className={`${styles.button} ${shapes === option.id ? styles.selected : ''}`}
            onClick={() => onChange({ ...value, shapes: option.id })}>{option.label}</button>)}
        </div>
      </div>
      <div className={styles.configGroup}>
        <span className={styles.label}>Example:</span>
        <div className={styles.buttonBar}>
          <button
            type="button"
            className={`${styles.button} ${workedExample ? styles.selected : ''}`}
            onClick={() => onChange({ ...value, workedExample: true })}
            aria-pressed={workedExample}
            title="Complete the first row as a guide"
          >
            First row
          </button>
          <button
            type="button"
            className={`${styles.button} ${!workedExample ? styles.selected : ''}`}
            aria-pressed={!workedExample}
            onClick={() => onChange({ ...value, workedExample: false })}
          >
            None
          </button>
        </div>
      </div>
    </div>
  );
}
