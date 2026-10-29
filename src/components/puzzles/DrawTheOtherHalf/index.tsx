import { useMemo } from 'react';
import type { PuzzleProps } from '../../../types/puzzle';
import { CELL_SIZE_MM } from '../../../types/puzzle';
import {
  generateDrawTheOtherHalf,
  traceDots,
  type HelpLevel,
  type MirrorLine,
  type Point,
  type ShapeLevel,
  type Subject,
} from './generator';
import styles from './DrawTheOtherHalf.module.css';

export interface DrawTheOtherHalfConfig {
  /** A random shape, or a picture from the hand-kept set. */
  subject: Subject;
  /** How many lines, how far out, and whether any slant. */
  level: ShapeLevel;
  /** How much of the missing half is shown. */
  help: HelpLevel;
  /** Down the middle (draw on the right) or across it (draw underneath). */
  mirror: MirrorLine;
}

const toPath = (lines: Point[][]) => lines
  .map(points => points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join(''))
  .join('');

export default function DrawTheOtherHalf({ gridWidth, gridHeight, seed, config }: PuzzleProps<DrawTheOtherHalfConfig>) {
  const level = config?.level ?? 'easy';
  const help = config?.help ?? 'corners';
  const mirror = config?.mirror ?? 'vertical';
  const subject = config?.subject ?? 'shape';

  const puzzle = useMemo(
    () => generateDrawTheOtherHalf(gridWidth, gridHeight, seed, level, mirror, subject, CELL_SIZE_MM),
    [gridWidth, gridHeight, seed, level, mirror, subject],
  );

  const [from, to] = puzzle.mirror;

  return (
    <div className={styles.container}>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${puzzle.width} ${puzzle.height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <line x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]} className={styles.mirror} />
        {puzzle.dots.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={0.7} className={styles.gridDot} />
        ))}
        <path d={toPath(puzzle.given)} className={styles.given} />
        {help === 'dotted' && puzzle.answer.flatMap(traceDots).map(([x, y], i) => (
          <circle key={`t${i}`} cx={x} cy={y} r={0.5} className={styles.trace} />
        ))}
        {help === 'corners' && puzzle.corners.map(([x, y], i) => (
          <circle key={`c${i}`} cx={x} cy={y} r={1.4} className={styles.corner} />
        ))}
      </svg>
    </div>
  );
}
