import { useId, useMemo } from 'react';
import type { PuzzleProps } from '../../../types/puzzle';
import {
  generateDirections,
  directionsAnswer,
  DIRECTION_ARROWS,
  TOKEN_WIDTH_MM,
  stripHeightMm,
  type DirectionsMode,
  type Notation,
  type RouteLength,
  type Token,
} from './generator';
import { InlineIcon, MapIcon } from './MapIcon';
import { flowingPath } from '../../../utils/flowingPath';
import AnswerPath from '../../AnswerPath';
import AnswerCircle from '../../AnswerCircle';
import styles from './Directions.module.css';

export interface DirectionsConfig {
  mode: DirectionsMode;
  notation: Notation;
  length: RouteLength;
  /** Write mode: draw a few more boxes than the shortest answer needs. */
  spareBoxes: boolean;
}

function tokenText({ dir, count }: Token, notation: Notation): string {
  if (notation === 'arrows') return DIRECTION_ARROWS[dir];
  if (notation === 'counts') return `${count} ${DIRECTION_ARROWS[dir]}`;
  return `${count} ${dir}`;
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

export default function Directions({ showAnswers = false, gridWidth, gridHeight, seed, config }: PuzzleProps<DirectionsConfig>) {
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

  const answer = useMemo(() => showAnswers ? directionsAnswer(puzzle, mode, notation) : [], [puzzle, mode, notation, showAnswers]);
  const routePath = () => {
    let { x, y } = puzzle.start;
    const points = [{ x: (x + 0.5) * cellMm, y: (y + 0.5) * cellMm }];
    for (const token of answer) {
      x += token.dir === 'right' ? token.count : token.dir === 'left' ? -token.count : 0;
      y += token.dir === 'down' ? token.count : token.dir === 'up' ? -token.count : 0;
      points.push({ x: (x + 0.5) * cellMm, y: (y + 0.5) * cellMm });
    }
    return flowingPath(points, cellMm * 0.18, cellMm * 0.012);
  };
  const gridLines = [
    ...Array.from({ length: cols - 1 }, (_, i) => `M${(i + 1) * cellMm} 0 V${height}`),
    ...Array.from({ length: rows - 1 }, (_, i) => `M0 ${(i + 1) * cellMm} H${width}`),
  ].join(' ');

  return (
    <div className={styles.container}>
      <div className={styles.prompt}>
        {showAnswers && mode === 'write'
          ? <span data-answer="text">Example route from <InlineIcon icon="ship" /> to <InlineIcon icon="chest" />.</span>
          : <Prompt mode={mode} notation={notation} />}
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
            {showAnswers && <AnswerPath d={routePath()} />}
            {showAnswers && mode === 'follow' && <path data-answer="path" strokeWidth="0.9"
              d={`M${(puzzle.goal.x + 0.25) * cellMm} ${(puzzle.goal.y + 0.25) * cellMm}l${cellMm * 0.5} ${cellMm * 0.5}m0 ${-cellMm * 0.5}l${-cellMm * 0.5} ${cellMm * 0.5}`} />}
          </g>
          <rect width={width} height={height} className={styles.border} />
        </svg>
      </div>

      <div className={styles.strip} style={{ height: `${stripHeightMm(puzzle.stripLines)}mm` }}>
        {mode === 'write'
          ? Array.from({ length: puzzle.boxCount }, (_, i) => (
              <span key={i} className={`${styles.token} ${styles.answerBox} ${notation === 'arrows' ? '' : styles.boxed}`} data-answer={showAnswers && answer[i] ? "text" : undefined} style={{ width: tokenWidth }}>{showAnswers && answer[i] && tokenText(answer[i], notation)}</span>
            ))
          : puzzle.tokens.map((token, i) => (
              <span
                key={i}
                className={`${styles.token} ${notation === 'arrows' ? '' : styles.boxed}`}
                style={{ width: tokenWidth }}
              >
                <span data-answer-circle={showAnswers && i === puzzle.mistake?.index || undefined}>{tokenText(token, notation)}{showAnswers && i === puzzle.mistake?.index && <AnswerCircle seed={`${seed}:direction:${i}`} />}</span>
                {showAnswers && i === puzzle.mistake?.index && <span className={styles.correction} data-answer="text">{tokenText(puzzle.mistake.correct, notation)}</span>}
              </span>
            ))}
      </div>
    </div>
  );
}
