import { useId, useMemo } from 'react';
import { ART } from './art';
import type { Stage } from './cycles';
import {
  generateLifeCycles,
  type LifeCyclesChoice,
  type LifeCyclesTask,
  type MissingCircle,
} from './generator';
import { CELL_SIZE_MM, type PuzzleProps } from '../../../types/puzzle';
import styles from './LifeCycles.module.css';

export interface LifeCyclesConfig {
  task: LifeCyclesTask;
  cycle: LifeCyclesChoice;
  firstShown: boolean;
}

/** Answer box under each jumbled picture, mm. */
const BOX_MM = 8;
/** Noto draws its emoji a little inside the em box. */
const EMOJI_SCALE = 0.82;
/**
 * Our art is drawn a margin inside its 128 box, and most of it is wider than
 * tall where emoji are round, so it is shown zoomed in to look the same size.
 * Overflow is visible, so nothing near the edge is cut off.
 */
const ART_VIEW = '8 8 112 112';

function Picture({ stage, size }: { stage: Stage; size: number }) {
  const box = { width: `${size}mm`, height: `${size}mm` };
  if (stage.art) {
    return (
      <svg viewBox={ART_VIEW} className={styles.art} style={box} role="img" aria-label={stage.name}>
        {ART[stage.art]}
      </svg>
    );
  }
  return (
    <span
      className={styles.emoji}
      style={{ ...box, fontSize: `${size * EMOJI_SCALE}mm` }}
      role="img"
      aria-label={stage.name}
    >
      {stage.emoji}
    </span>
  );
}

/**
 * The stages round a circle, clockwise from the top, joined by arrows. One is
 * a dashed ring for the child to draw in.
 */
function Circle({ circle, size }: { circle: MissingCircle; size: number }) {
  const arrowId = useId();
  const n = circle.stages.length;
  const centre = size / 2;
  const radius = size * 0.34;
  // Pictures as big as the gap between neighbours allows
  const picture = Math.min(size * 0.29, 2 * radius * Math.sin(Math.PI / n) * 0.7);
  const at = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const point = (angle: number) => [centre + radius * Math.cos(angle), centre + radius * Math.sin(angle)];
  // How far round the circle each picture reaches, so arrows start clear of it
  const clear = Math.asin(Math.min(1, (picture * 0.62) / radius));

  return (
    <div className={styles.circle} style={{ width: `${size}mm`, height: `${size}mm` }}>
      <svg className={styles.arrows} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <marker id={arrowId} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4" markerHeight="4" orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" fill="#888" />
          </marker>
        </defs>
        {circle.stages.map((_, i) => {
          const [x1, y1] = point(at(i) + clear);
          const [x2, y2] = point(at(i + 1) - clear);
          return (
            <path
              key={i}
              d={`M${x1},${y1} A${radius},${radius} 0 0 1 ${x2},${y2}`}
              fill="none"
              stroke="#888"
              strokeWidth={size * 0.012}
              strokeLinecap="round"
              markerEnd={`url(#${CSS.escape(arrowId)})`}
            />
          );
        })}
      </svg>
      {circle.stages.map((stage, i) => {
        const [x, y] = point(at(i));
        const style = { left: `${x - picture / 2}mm`, top: `${y - picture / 2}mm` };
        return i === circle.missing ? (
          <div
            key={i}
            className={styles.blank}
            style={{ ...style, width: `${picture}mm`, height: `${picture}mm` }}
          />
        ) : (
          <div key={i} className={styles.placed} style={style}>
            <Picture stage={stage} size={picture} />
          </div>
        );
      })}
    </div>
  );
}

export default function LifeCycles({
  gridWidth = 8,
  gridHeight = 4,
  seed,
  config,
}: PuzzleProps<LifeCyclesConfig>) {
  const task = config?.task ?? 'number';
  const cycle = config?.cycle ?? 'mixed';
  const firstShown = config?.firstShown ?? true;

  const puzzle = useMemo(
    () => generateLifeCycles(gridWidth, gridHeight, seed, task, cycle),
    [gridWidth, gridHeight, seed, task, cycle]
  );

  const width = gridWidth * CELL_SIZE_MM;
  const height = gridHeight * CELL_SIZE_MM;

  if (puzzle.task === 'missing') {
    const count = puzzle.circles.length;
    const size = puzzle.across
      ? Math.min(width / count, height)
      : Math.min(width, height / count);
    return (
      <div className={`${styles.container} ${puzzle.across ? '' : styles.down}`}>
        {puzzle.circles.map((c, i) => <Circle key={i} circle={c} size={size} />)}
      </div>
    );
  }

  const rowHeight = height / puzzle.rows.length;
  return (
    <div className={`${styles.container} ${styles.down}`}>
      {puzzle.rows.map((row, r) => {
        const n = row.stages.length;
        const picture = Math.min(rowHeight - BOX_MM - 5, width / n - 3, 45);
        return (
          <div key={r} className={styles.row}>
            {row.stages.map(({ stage, place }) => (
              <div key={place} className={styles.item}>
                <Picture stage={stage} size={picture} />
                <div className={styles.answer} style={{ width: `${BOX_MM}mm`, height: `${BOX_MM}mm` }}>
                  {firstShown && place === 1 && '1'}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
