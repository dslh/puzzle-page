import type { PatternSequenceConfig } from './index';
import {
  DEFAULT_PATTERN_OPTIONS,
  type FillMode,
  type GapMode,
  type PatternFamily,
  type PatternStyle,
} from './generator';
import styles from './PatternSequenceConfigBar.module.css';

interface PatternSequenceConfigBarProps {
  value: PatternSequenceConfig;
  onChange: (config: PatternSequenceConfig) => void;
}

const STYLES: Array<{ style: PatternStyle; label: string; tooltip: string }> = [
  { style: 'shapes', label: '△ Shapes', tooltip: 'Draw the missing shape - just needs a pen' },
  { style: 'colours', label: '● Colours', tooltip: 'Colour in the missing circle' },
];

const FAMILIES: Array<{ family: PatternFamily; label: string; tooltip: string }> = [
  { family: 'simple', label: 'AB ABC', tooltip: 'AB and ABC' },
  { family: 'doubles', label: 'AAB ABB', tooltip: 'AAB, ABB and AABB' },
  { family: 'four', label: 'ABCD ABAC', tooltip: 'ABCD and ABAC' },
  { family: 'growing', label: 'Growing', tooltip: 'A B, A B B, A B B B, ...' },
  { family: 'mirror', label: 'Mirror', tooltip: 'There and back: ABCB, ABBA, ABCCBA, ABCDCB' },
];

const FILLS: Array<{ fill: FillMode; label: string; tooltip: string }> = [
  { fill: 'mixed', label: 'Some', tooltip: 'Some shapes are coloured in' },
  { fill: 'outline', label: 'None', tooltip: 'Outlines only' },
  {
    fill: 'separate',
    label: 'Own pattern',
    tooltip: 'Colouring-in follows its own repeat, out of step with the shapes',
  },
];

const GAPS: Array<{ gaps: GapMode; label: string; tooltip: string }> = [
  { gaps: 'end', label: 'End', tooltip: 'What comes next?' },
  { gaps: 'anywhere', label: 'Anywhere', tooltip: 'One gap, at the end or in the middle' },
  { gaps: 'two', label: 'Two', tooltip: 'Two gaps per row' },
];

export default function PatternSequenceConfigBar({ value, onChange }: PatternSequenceConfigBarProps) {
  const { style, families, fill, gaps } = { ...DEFAULT_PATTERN_OPTIONS, ...value };

  const toggleFamily = (family: PatternFamily) => {
    if (families.includes(family)) {
      // Keep at least one switched on
      if (families.length > 1) {
        onChange({ ...value, families: families.filter((f) => f !== family) });
      }
    } else {
      // Keep the toolbar's order, so the config compares equal however it was built
      const next = FAMILIES.map((f) => f.family).filter(
        (f) => f === family || families.includes(f)
      );
      onChange({ ...value, families: next });
    }
  };

  return (
    <div className={styles.configContainer}>
      <div className={styles.configGroup}>
        <span className={styles.label}>Style:</span>
        <div className={styles.buttonBar}>
          {STYLES.map((s) => (
            <button
              key={s.style}
              type="button"
              className={`${styles.button} ${style === s.style ? styles.selected : ''}`}
              onClick={() => onChange({ ...value, style: s.style })}
              title={s.tooltip}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.configGroup}>
        <span className={styles.label}>Patterns:</span>
        <div className={styles.chips}>
          {FAMILIES.map((f) => (
            <button
              key={f.family}
              type="button"
              className={`${styles.button} ${families.includes(f.family) ? styles.selected : ''}`}
              onClick={() => toggleFamily(f.family)}
              title={f.tooltip}
              aria-pressed={families.includes(f.family)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {style === 'shapes' && (
        <div className={styles.configGroup}>
          <span className={styles.label}>Filled:</span>
          <div className={styles.buttonBar}>
            {FILLS.map((f) => (
              <button
                key={f.fill}
                type="button"
                className={`${styles.button} ${fill === f.fill ? styles.selected : ''}`}
                onClick={() => onChange({ ...value, fill: f.fill })}
                title={f.tooltip}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={styles.configGroup}>
        <span className={styles.label}>Gaps:</span>
        <div className={styles.buttonBar}>
          {GAPS.map((g) => (
            <button
              key={g.gaps}
              type="button"
              className={`${styles.button} ${gaps === g.gaps ? styles.selected : ''}`}
              onClick={() => onChange({ ...value, gaps: g.gaps })}
              title={g.tooltip}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
