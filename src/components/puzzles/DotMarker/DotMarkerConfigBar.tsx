import type { DotMarkerConfig } from './index';
import { PICTURES, SHAPES, shapeExtras, shapeVertices, type DotShape } from './generator';
import styles from './DotMarkerConfigBar.module.css';

interface ConfigBarProps {
  value: DotMarkerConfig;
  onChange: (config: DotMarkerConfig) => void;
}

const SIZES = [
  { id: 'small', label: 'Small', title: 'Dots about 12mm across, for small stickers or a crayon' },
  { id: 'medium', label: 'Medium', title: 'Dots about 15mm across' },
  { id: 'big', label: 'Big', title: 'Dots about 20mm across, for a chunky marker' },
] as const;

const FILLS = [
  { id: 'outline', label: 'Edge', title: 'Dots round the edge of the shape' },
  { id: 'filled', label: 'Filled', title: 'Dots round the edge and all over the inside' },
] as const;

function ShapeIcon({ shape }: { shape: DotShape }) {
  // Fit each outline's box into the icon, centred
  const vertices = shapeVertices(shape);
  const extras = shapeExtras(shape);
  const xs = [vertices, ...extras].flat().map(p => p.x);
  const ys = [vertices, ...extras].flat().map(p => p.y);
  const scale = 13 / Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
  const cx = (Math.max(...xs) + Math.min(...xs)) / 2;
  const cy = (Math.max(...ys) + Math.min(...ys)) / 2;
  const toPoints = (points: { x: number; y: number }[]) =>
    points.map(p => `${((p.x - cx) * scale).toFixed(1)},${((p.y - cy) * scale).toFixed(1)}`).join(' ');
  return (
    <svg className={styles.icon} viewBox="-8 -8 16 16" aria-hidden="true">
      {extras.map((extra, i) => (
        <polygon key={i} points={toPoints(extra)} className={styles.iconExtra} />
      ))}
      <polygon points={toPoints(vertices)} />
    </svg>
  );
}

export default function DotMarkerConfigBar({ value, onChange }: ConfigBarProps) {
  return (
    <div className={styles.configContainer}>
      <div className={`${styles.configGroup} ${styles.stacked}`}>
        <span className={styles.label}>Shape:</span>
        {/* Plain shapes on one row, pictures on the next */}
        {[false, true].map(pictures => (
          <div key={String(pictures)} className={styles.buttonBar}>
            {SHAPES.filter(s => !s.picture === !pictures).map(s => (
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
        ))}
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
        <select
          className={styles.select}
          value={value.picture}
          onChange={e => onChange({ ...value, picture: e.target.value })}
          title="A picture in the middle to talk about"
        >
          <option value="random">Random</option>
          {PICTURES.map(p => (
            <option key={p.emoji} value={p.emoji}>
              {p.emoji} {p.label}
            </option>
          ))}
          <option value="none">None</option>
        </select>
      </div>
    </div>
  );
}
