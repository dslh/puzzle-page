import { CELL_SIZE_MM } from '../../types/puzzle';
import type { AnyPuzzleDefinition } from '../puzzles';
import styles from './PuzzleHelp.module.css';

interface PuzzleExampleProps {
  definition: AnyPuzzleDefinition;
  config: unknown;
  width: number;
  height: number;
  seed: number;
  /** 1 is printed size. */
  scale?: number;
}

/** A puzzle drawn on its own scrap of paper, the way it sits on the page. */
export default function PuzzleExample({ definition, config, width, height, seed, scale = 1 }: PuzzleExampleProps) {
  // Cast needed: registry aggregates heterogeneous puzzle types
  const Component = definition.component as React.ComponentType<{
    gridWidth: number;
    gridHeight: number;
    seed: number;
    config: unknown;
  }>;

  return (
    <div className={styles.examplePaper} style={{ zoom: scale }}>
      <div
        className={styles.exampleArea}
        style={{ width: `${width * CELL_SIZE_MM}mm`, height: `${height * CELL_SIZE_MM}mm` }}
      >
        <Component gridWidth={width} gridHeight={height} seed={seed} config={config} />
      </div>
    </div>
  );
}
