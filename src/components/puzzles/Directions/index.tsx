import { useId, useMemo } from 'react';
import type { PuzzleProps } from '../../../types/puzzle';
import { ART, type ArtName } from './art';
import {
  generateDirections,
  DIRECTION_ARROWS,
  TOKEN_WIDTH_MM,
  stripHeightMm,
  type DirectionsMode,
  type Notation,
  type RouteLength,
  type Token,
} from './generator';
import type { Stamp } from './island';
import styles from './Directions.module.css';

export interface DirectionsConfig {
  mode: DirectionsMode;
  notation: Notation;
  length: RouteLength;
  /** Write mode: draw a few more boxes than the shortest answer needs. */
  spareBoxes: boolean;
}

/** Line weights, in mm, kept the same whatever size an icon is drawn at. */
const THICK_MM = 0.45;
const THIN_MM = 0.25;

function tokenText({ dir, count }: Token, notation: Notation): string {
  if (notation === 'arrows') return DIRECTION_ARROWS[dir];
  if (notation === 'counts') return `${count} ${DIRECTION_ARROWS[dir]}`;
  return `${count} ${dir}`;
}

/** An icon from the art set, drawn into an enclosing SVG in mm. */
function MapIcon({ icon, x, y, size }: Stamp) {
  const { box, thick, thin } = ART[icon];
  const s = size / Math.max(box[2] - box[0], box[3] - box[1]);
  const tx = x - (s * (box[0] + box[2])) / 2;
  const ty = y - (s * (box[1] + box[3])) / 2;
  return (
    <g transform={`translate(${tx} ${ty}) scale(${s})`} className={styles.icon}>
      <path d={thick} strokeWidth={THICK_MM / s} />
      <path d={thin} strokeWidth={THIN_MM / s} />
    </g>
  );
}

/** An icon set into a line of text. */
function InlineIcon({ icon }: { icon: ArtName }) {
  const { box, thick, thin } = ART[icon];
  // Drawn small, so heavier than the pack's own weights of 2 and 1
  return (
    <svg
      className={`${styles.icon} ${styles.inlineIcon}`}
      viewBox={`${box[0] - 2} ${box[1] - 2} ${box[2] - box[0] + 4} ${box[3] - box[1] + 4}`}
    >
      <path d={thick} strokeWidth={3.5} />
      <path d={thin} strokeWidth={2} />
    </svg>
  );
}

/** A plain X, as the child will draw it - the art set's cross is too fussy small. */
function DrawnX() {
  return (
    <svg className={styles.inlineIcon} viewBox="0 0 10 10">
      <path d="M1.5 1.5 L8.5 8.5 M8.5 1.5 L1.5 8.5" className={styles.drawnX} />
    </svg>
  );
}

/**
 * What the parent reads out. Kept short: it has to fit on one line at the
 * minimum width of 4, which leaves about 70mm.
 */
function Prompt({ mode, notation }: { mode: DirectionsMode; notation: Notation }) {
  const steps = notation === 'words' ? 'steps' : 'arrows';
  switch (mode) {
    case 'follow':
      return <>Where is the treasure? Draw <DrawnX />.</>;
    case 'write':
      return <>Write the {steps} from <InlineIcon icon="ship" /> to <InlineIcon icon="chest" />.</>;
    case 'fix':
      return <>One {notation === 'words' ? 'step' : 'arrow'} is wrong. Circle it.</>;
  }
}

export default function Directions({ gridWidth, gridHeight, seed, config }: PuzzleProps<DirectionsConfig>) {
  const mode = config?.mode ?? 'follow';
  const notation = config?.notation ?? 'arrows';
  const length = config?.length ?? 'medium';
  const spareBoxes = config?.spareBoxes ?? false;
  const clipId = useId();

  const puzzle = useMemo(
    () => generateDirections(gridWidth, gridHeight, seed, mode, notation, length, spareBoxes),
    [gridWidth, gridHeight, seed, mode, notation, length, spareBoxes]
  );

  const { cols, rows, cellMm, stamps, coast, echoes } = puzzle;
  const width = cols * cellMm;
  const height = rows * cellMm;
  const tokenWidth = `${TOKEN_WIDTH_MM[notation]}mm`;

  const gridLines = [
    ...Array.from({ length: cols - 1 }, (_, i) => `M${(i + 1) * cellMm} 0 V${height}`),
    ...Array.from({ length: rows - 1 }, (_, i) => `M0 ${(i + 1) * cellMm} H${width}`),
  ].join(' ');

  return (
    <div className={styles.container}>
      <div className={styles.prompt}>
        <Prompt mode={mode} notation={notation} />
      </div>

      <div className={styles.mapArea}>
        <svg
          className={styles.map}
          width={`${width}mm`}
          height={`${height}mm`}
          viewBox={`0 0 ${width} ${height}`}
        >
          <defs>
            <clipPath id={clipId}>
              <rect width={width} height={height} />
            </clipPath>
          </defs>
          <g clipPath={`url(#${clipId})`}>
            <rect width={width} height={height} className={styles.sea} />
            {coast.map((d, i) => <path key={i} d={d} className={styles.land} />)}
            {echoes.map((d, i) => <path key={i} d={d} className={styles.echo} />)}
            <path d={gridLines} className={styles.gridLines} />
            {coast.map((d, i) => <path key={i} d={d} className={styles.coast} />)}
            {stamps.map((stamp, i) => <MapIcon key={i} {...stamp} />)}
          </g>
          <rect width={width} height={height} className={styles.border} />
        </svg>
      </div>

      <div className={styles.strip} style={{ height: `${stripHeightMm(puzzle.stripLines)}mm` }}>
        {mode === 'write'
          ? Array.from({ length: puzzle.boxCount }, (_, i) => (
              <span key={i} className={`${styles.token} ${styles.answerBox}`} style={{ width: tokenWidth }} />
            ))
          : puzzle.tokens.map((token, i) => (
              <span
                key={i}
                className={`${styles.token} ${notation === 'arrows' ? '' : styles.boxed}`}
                style={{ width: tokenWidth }}
              >
                {tokenText(token, notation)}
              </span>
            ))}
      </div>
    </div>
  );
}
