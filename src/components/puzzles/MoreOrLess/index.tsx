import { useMemo } from 'react';
import { generateMoreOrLess, type Side } from './generator';
import type { PuzzleProps } from '../../../types/puzzle';
import styles from './MoreOrLess.module.css';

export interface MoreOrLessConfig {
  workedExample: boolean;
}

function SideBox({ side, width, height }: { side: Side; width: number; height: number }) {
  return (
    <span className={styles.side} style={{ width: `${width}mm`, height: `${height}mm` }}>
      {side.positions.map((p, i) => (
        <span key={i} className={styles.emoji} style={{ left: `${p.x}mm`, top: `${p.y}mm` }}>
          {side.emoji}
        </span>
      ))}
    </span>
  );
}

export default function MoreOrLess({
  gridWidth = 6,
  gridHeight = 7,
  seed,
  config,
}: PuzzleProps<MoreOrLessConfig>) {
  const workedExample = config?.workedExample ?? true;

  const puzzle = useMemo(
    () => generateMoreOrLess(gridWidth, gridHeight, seed, workedExample),
    [gridWidth, gridHeight, seed, workedExample]
  );

  return (
    <div className={styles.container}>
      <div className={styles.key}>
        <span>&gt;</span>
        <span>=</span>
        <span>&lt;</span>
      </div>
      {puzzle.problems.map((problem, rowIndex) => (
        <div key={rowIndex} className={styles.row}>
          <SideBox side={problem.left} width={puzzle.sideWidth} height={puzzle.sideHeight} />
          <span className={styles.answerBox}>
            {workedExample && rowIndex === 0 && (
              <span className={styles.filledIn}>{problem.relation}</span>
            )}
          </span>
          <SideBox side={problem.right} width={puzzle.sideWidth} height={puzzle.sideHeight} />
        </div>
      ))}
    </div>
  );
}
