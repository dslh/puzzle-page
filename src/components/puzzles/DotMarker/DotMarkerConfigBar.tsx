import type { DotMarkerConfig } from './index';
import { SHAPES, shapeVertices, type DotShape } from './generator';
import styles from './DotMarkerConfigBar.module.css';

interface ConfigBarProps {
  value: DotMarkerConfig;
  onChange: (config: DotMarkerConfig) => void;
}

const SIZES = [
  { id: 'small', label: 'Small', title: 'Dots about 15mm across' },
  { id: 'big', label: 'Big', title: 'Dots about 20mm across, for a chunky marker' },
] as const;

const FILLS = [
  { id: 'outline', label: 'Edge', title: 'Dots round the edge of the shape' },
  { id: 'filled', label: 'Filled', title: 'Dots round the edge and all over the inside' },
] as const;

function ShapeIcon({ shape }: { shape: DotShape }) {
  const points = shapeVertices(shape).map(p => `${(p.x * 6.5).toFixed(1)},${(p.y * 6.5).toFixed(1)}`).join(' ');
  return (
    <svg className={styles.icon} viewBox="-8 -8 16 16" aria-hidden="true">
      <polygon points={points} />
    </svg>
  );
}

export default function DotMarkerConfigBar({ value, onChange }: ConfigBarProps) {
  return (
    <div className={styles.configContainer}>
      <div className={styles.configGroup}>
        <span className={styles.label}>Shape:</span>
        <div className={styles.buttonBar}>
          {SHAPES.map(s => (
            <button
              key={s.id}
              type="button"
              className={`${styles.button} ${styles.iconButton} ${value.shape === s.id ? styles.selected : ''}`}
              onClick={() => onChange({ ...value, shape: s.id })}
              title={s.label}
              aria-label={s.label}
              aria-pressed={value.shape === s.id}
            >
              <ShapeIcon shape={s.id} />
            </button>
          ))}
        </div>
      </div>

      <div className={styles.configGroup}>
        <span className={styles.label}>Dots:</span>
        <div className={styles.buttonBar}>
          {SIZES.map(s => (
            <button
              key={s.id}
              type="button"
              className={`${styles.button} ${value.size === s.id ? styles.selected : ''}`}
              onClick={() => onChange({ ...value, size: s.id })}
              title={s.title}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.configGroup}>
        <span className={styles.label}>Where:</span>
        <div className={styles.buttonBar}>
          {FILLS.map(f => (
            <button
              key={f.id}
              type="button"
              className={`${styles.button} ${value.fill === f.id ? styles.selected : ''}`}
              onClick={() => onChange({ ...value, fill: f.id })}
              title={f.title}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.configGroup}>
        <span className={styles.label}>Picture:</span>
        <div className={styles.buttonBar}>
          {([true, false] as const).map(on => (
            <button
              key={String(on)}
              type="button"
              className={`${styles.button} ${value.picture === on ? styles.selected : ''}`}
              onClick={() => onChange({ ...value, picture: on })}
              title={on ? 'A picture in the middle to talk about' : 'Just the dots'}
            >
              {on ? 'On' : 'Off'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
