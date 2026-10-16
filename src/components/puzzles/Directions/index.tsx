import { useMemo } from 'react';
import type { PuzzleProps } from '../../../types/puzzle';
import {
  generateDirections,
  DIRECTION_ARROWS,
  THEMES,
  TOKEN_WIDTH_MM,
  type DirectionsMode,
  type Notation,
  type RouteLength,
  type Theme,
  type Token,
} from './generator';
import styles from './Directions.module.css';

export interface DirectionsConfig {
  mode: DirectionsMode;
  notation: Notation;
  theme: Theme;
  length: RouteLength;
  /** Write mode: draw a few more boxes than the shortest answer needs. */
  spareBoxes: boolean;
}

function tokenText({ dir, count }: Token, notation: Notation): string {
  if (notation === 'arrows') return DIRECTION_ARROWS[dir];
  if (notation === 'counts') return `${count} ${DIRECTION_ARROWS[dir]}`;
  return `${count} ${dir}`;
}

/**
 * What the parent reads out. Kept short: it has to fit on one line at the
 * minimum width of 4, which leaves about 70mm.
 */
function prompt(mode: DirectionsMode, notation: Notation, theme: Theme): string {
  const { start, goal } = THEMES[theme];
  const steps = notation === 'words' ? 'directions' : 'arrows';
  switch (mode) {
    case 'follow':
      return theme === 'robot'
        ? `Where does ${start} stop? Draw ${goal}.`
        : 'Where is the treasure? Draw ✖.';
    case 'write':
      return `Write the ${steps} from ${start} to ${goal}.`;
    case 'fix':
      return `One ${notation === 'words' ? 'step' : 'arrow'} is wrong. Circle it.`;
  }
}

export default function Directions({ gridWidth, gridHeight, seed, config }: PuzzleProps<DirectionsConfig>) {
  const mode = config?.mode ?? 'follow';
  const notation = config?.notation ?? 'arrows';
  const theme = config?.theme ?? 'robot';
  const length = config?.length ?? 'medium';
  const spareBoxes = config?.spareBoxes ?? false;

  const puzzle = useMemo(
    () => generateDirections(gridWidth, gridHeight, seed, mode, notation, theme, length, spareBoxes),
    [gridWidth, gridHeight, seed, mode, notation, theme, length, spareBoxes]
  );

  const { cols, rows, cellMm, obstacles, start, goal } = puzzle;
  const { start: startEmoji, goal: goalEmoji } = THEMES[theme];
  // Follow mode hides the goal: finding it is the puzzle
  const showGoal = mode !== 'follow';
  const tokenWidth = `${TOKEN_WIDTH_MM[notation]}mm`;

  const cells = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const k = `${x},${y}`;
      const content =
        x === start.x && y === start.y ? startEmoji
        : showGoal && x === goal.x && y === goal.y ? goalEmoji
        : obstacles.get(k);
      cells.push(
        <div key={k} className={styles.cell}>
          {content && (
            <span className={styles.emoji} style={{ fontSize: `${cellMm * 0.6}mm` }}>
              {content}
            </span>
          )}
        </div>
      );
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.prompt}>{prompt(mode, notation, theme)}</div>

      <div className={styles.mapArea}>
        <div
          className={styles.map}
          style={{
            gridTemplateColumns: `repeat(${cols}, ${cellMm}mm)`,
            gridTemplateRows: `repeat(${rows}, ${cellMm}mm)`,
          }}
        >
          {cells}
        </div>
      </div>

      <div className={styles.strip}>
        {mode === 'write'
          ? Array.from({ length: puzzle.boxCount }, (_, i) => (
              <span key={i} className={`${styles.token} ${styles.answerBox}`} style={{ width: tokenWidth }} />
            ))
          : puzzle.tokens.map((token, i) => (
              <span key={i} className={styles.token} style={{ width: tokenWidth }}>
                {tokenText(token, notation)}
              </span>
            ))}
      </div>
    </div>
  );
}
