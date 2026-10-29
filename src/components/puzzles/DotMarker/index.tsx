import { useMemo } from 'react';
import type { PuzzleProps } from '../../../types/puzzle';
import { generateDotMarker, type DotFill, type DotPicture, type DotShape, type DotSize } from './generator';
import styles from './DotMarker.module.css';

export interface DotMarkerConfig {
  /** A shape, or the letters of `text`. */
  shape: DotShape | 'letters';
  size: DotSize;
  /** Dots round the edge only, or filling the inside too. */
  fill: DotFill;
  /** A picture in the middle, to talk about: an emoji, 'random' or 'none'. */
  picture: DotPicture;
  /** Letters and digits to dot, such as a name. Empty: one letter, picked by the seed. */
  text: string;
}

export default function DotMarker({ gridWidth, gridHeight, seed, config }: PuzzleProps<DotMarkerConfig>) {
  const shape = config?.shape ?? 'heart';
  const size = config?.size ?? 'big';
  const fill = config?.fill ?? 'outline';
  const picture = config?.picture ?? 'random';
  const text = config?.text ?? '';

  const puzzle = useMemo(
    () => generateDotMarker(gridWidth, gridHeight, seed, shape, size, fill, picture, text),
    [gridWidth, gridHeight, seed, shape, size, fill, picture, text],
  );

  const toPoints = (points: { x: number; y: number }[]) => points.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');

  return (
    <div className={styles.container}>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${puzzle.width} ${puzzle.height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {puzzle.extras.map((extra, i) => (
          <polygon key={i} points={toPoints(extra)} className={styles.extra} />
        ))}
        {puzzle.outline.length > 0 && <polygon points={toPoints(puzzle.outline)} className={styles.outline} />}
        {puzzle.lines.map((line, i) => (
          <polyline key={i} points={toPoints(line)} className={styles.line} />
        ))}
        {puzzle.dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={puzzle.radius} className={styles.dot} />
        ))}
        {puzzle.picture && (
          <text
            x={puzzle.picture.at.x}
            y={puzzle.picture.at.y}
            fontSize={puzzle.picture.size}
            textAnchor="middle"
            dominantBaseline="central"
          >
            {puzzle.picture.emoji}
          </text>
        )}
      </svg>
    </div>
  );
}
