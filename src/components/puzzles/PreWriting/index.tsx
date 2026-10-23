import { useMemo } from 'react';
import type { PuzzleProps } from '../../../types/puzzle';
import {
  DEFAULT_PATTERNS,
  generatePreWriting,
  ROAD_EDGE,
  type LineStyle,
  type PatternId,
  type PatternSize,
  type Point,
} from './generator';
import styles from './PreWriting.module.css';

export interface PreWritingConfig {
  /** A road to steer along, or a dotted line to trace. */
  line: LineStyle;
  /** Which patterns to use, one per row, in teaching order. */
  patterns: PatternId[];
  size: PatternSize;
  /** Dotted only: trace to the end, or trace some and carry on alone. */
  finish: 'trace' | 'continue';
}

const toPath = (points: Point[], dy: number) =>
  points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)} ${(y + dy).toFixed(2)}`).join('');

export default function PreWriting({ gridWidth, gridHeight, seed, config }: PuzzleProps<PreWritingConfig>) {
  const line = config?.line ?? 'dotted';
  const patterns = config?.patterns ?? DEFAULT_PATTERNS;
  const size = config?.size ?? 'medium';
  const finish = config?.finish ?? 'continue';

  const puzzle = useMemo(
    () => generatePreWriting(gridWidth, gridHeight, seed, line, patterns, size, finish),
    [gridWidth, gridHeight, seed, line, patterns, size, finish],
  );

  return (
    <div className={styles.container}>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${puzzle.width} ${puzzle.height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {puzzle.rows.map((row, i) => {
          if (row.kind === 'road') {
            const d = toPath(row.path, row.y);
            return (
              <g key={i}>
                <path d={d} className={styles.roadEdge} strokeWidth={puzzle.roadWidth + 2 * ROAD_EDGE} />
                <path d={d} className={styles.roadSurface} strokeWidth={puzzle.roadWidth} />
                {([[row.from, row.theme.start], [row.to, row.theme.end]] as const).map(([[x, y], emoji]) => (
                  <text
                    key={emoji}
                    x={x}
                    y={y + row.y}
                    fontSize={row.emojiSize * 0.8}
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    {emoji}
                  </text>
                ))}
              </g>
            );
          }
          return (
            <g key={i}>
              {row.example.map((stroke, j) => (
                <path key={`e${j}`} d={toPath(stroke, row.y)} className={styles.example} />
              ))}
              {row.trace.map((stroke, j) => (
                <path
                  key={`t${j}`}
                  d={toPath(stroke, row.y)}
                  className={styles.trace}
                  strokeDasharray={`0 ${puzzle.dotSpacing}`}
                  strokeWidth={Math.min(1, puzzle.dotSpacing * 0.5)}
                />
              ))}
              {row.starts.map(([x, y], j) => (
                <circle key={`s${j}`} cx={x} cy={y + row.y} r={1.1} className={styles.start} />
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
