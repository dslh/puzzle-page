import type { PreWritingConfig } from './index';
import { PATTERNS, ROAD_PATTERNS, previewStrokes, type PatternId } from './generator';
import styles from './PreWritingConfigBar.module.css';

interface ConfigBarProps {
  value: PreWritingConfig;
  onChange: (config: PreWritingConfig) => void;
}

const LINES = [
  { id: 'wide', label: 'Wide', title: 'A wide road to steer along, between two edges' },
  { id: 'narrow', label: 'Thin', title: 'A thinner road: more pencil control' },
  { id: 'dotted', label: 'Dotted', title: 'A dotted line to trace, after a solid example' },
] as const;

const SIZES = [
  { id: 'small', label: 'Small' },
  { id: 'medium', label: 'Medium' },
  { id: 'large', label: 'Large' },
] as const;

const ICON_W = 22;
const ICON_H = 13;

function PatternIcon({ pattern }: { pattern: PatternId }) {
  const strokes = previewStrokes(pattern, ICON_W, ICON_H);
  const d = strokes
    .map(stroke => stroke.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${(y + ICON_H / 2).toFixed(1)}`).join(''))
    .join('');
  return (
    <svg className={styles.icon} viewBox={`-1 -1 ${ICON_W + 2} ${ICON_H + 2}`} aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

export default function PreWritingConfigBar({ value, onChange }: ConfigBarProps) {
  const { line, patterns, size, finish } = value;
  const isRoad = line !== 'dotted';
  const fitsLine = (id: PatternId) => !isRoad || ROAD_PATTERNS.has(id);

  const setLine = (next: PreWritingConfig['line']) => {
    // A road needs at least one flowing pattern among those chosen
    const needsOne = next !== 'dotted' && !patterns.some(p => ROAD_PATTERNS.has(p));
    onChange({ ...value, line: next, patterns: needsOne ? [...patterns, 'waves'] : patterns });
  };

  const toggle = (id: PatternId) => {
    const on = patterns.includes(id);
    const next = on ? patterns.filter(p => p !== id) : [...patterns, id];
    // Keep at least one this line can draw
    if (!next.some(fitsLine)) return;
    onChange({ ...value, patterns: next });
  };

  return (
    <div className={styles.configContainer}>
      <div className={styles.configGroup}>
        <span className={styles.label}>Line:</span>
        <div className={styles.buttonBar}>
          {LINES.map(l => (
            <button
              key={l.id}
              type="button"
              className={`${styles.button} ${line === l.id ? styles.selected : ''}`}
              onClick={() => setLine(l.id)}
              title={l.title}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className={`${styles.configGroup} ${styles.stacked}`}>
        <span className={styles.label}>Shapes:</span>
        <div className={styles.buttonBar}>
          {PATTERNS.map(p => {
            const usable = fitsLine(p.id);
            return (
              <button
                key={p.id}
                type="button"
                className={`${styles.button} ${styles.iconButton} ${usable && patterns.includes(p.id) ? styles.selected : ''}`}
                onClick={() => toggle(p.id)}
                disabled={!usable}
                title={usable ? p.label : `${p.label}: dotted only`}
                aria-label={p.label}
                aria-pressed={usable && patterns.includes(p.id)}
              >
                <PatternIcon pattern={p.id} />
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.configGroup}>
        <span className={styles.label}>Size:</span>
        <div className={styles.buttonBar}>
          {SIZES.map(s => (
            <button
              key={s.id}
              type="button"
              className={`${styles.button} ${size === s.id ? styles.selected : ''}`}
              onClick={() => onChange({ ...value, size: s.id })}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.configGroup}>
        <span className={styles.label}>End:</span>
        <div className={styles.buttonBar}>
          {(['trace', 'continue'] as const).map(f => (
            <button
              key={f}
              type="button"
              className={`${styles.button} ${!isRoad && finish === f ? styles.selected : ''}`}
              onClick={() => onChange({ ...value, finish: f })}
              disabled={isRoad}
              title={
                isRoad
                  ? 'Dotted only: a road runs from end to end'
                  : f === 'trace'
                    ? 'Dots all the way along'
                    : 'Dots part of the way, then space to carry on alone'
              }
            >
              {f === 'trace' ? 'Trace all' : 'Carry on'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
