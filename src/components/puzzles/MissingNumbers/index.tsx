import { useMemo } from 'react';
import {
  generateMissingNumbers,
  type MissingNumbersDirection,
  type MissingNumbersGaps,
  type MissingNumbersLayout,
  type MissingNumbersRange,
  type MissingNumbersStep,
  type NumberCell,
} from './generator';
import type { PuzzleProps } from '../../../types/puzzle';
import styles from './MissingNumbers.module.css';

export interface MissingNumbersConfig {
  layout: MissingNumbersLayout;
  range: MissingNumbersRange;
  step: MissingNumbersStep;
  direction: MissingNumbersDirection;
  gaps: MissingNumbersGaps;
}

function Box({ cell }: { cell: NumberCell }) {
  return (
    <div className={styles.box}>{!cell.blank && cell.value}</div>
  );
}

export default function MissingNumbers({
  gridWidth = 6,
  gridHeight = 4,
  seed,
  config,
}: PuzzleProps<MissingNumbersConfig>) {
  const layout = config?.layout ?? 'track';
  const range = config?.range ?? 20;
  const step = config?.step ?? 1;
  const direction = config?.direction ?? 'forwards';
  const gaps = config?.gaps ?? 'some';

  const puzzle = useMemo(
    () => generateMissingNumbers(gridWidth, gridHeight, seed, layout, range, step, direction, gaps),
    [gridWidth, gridHeight, seed, layout, range, step, direction, gaps]
  );

  if (puzzle.layout === 'square') {
    return (
      <div className={styles.container}>
        <div className={styles.square}>
          {puzzle.rows.map((row, r) => (
            <div key={r} className={styles.squareRow}>
              {row.map((cell, c) => <Box key={c} cell={cell} />)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${styles.tracks}`}>
      {puzzle.rows.map((row, r) => (
        <div key={r} className={styles.track}>
          {row.map((cell, c) => <Box key={c} cell={cell} />)}
        </div>
      ))}
    </div>
  );
}
