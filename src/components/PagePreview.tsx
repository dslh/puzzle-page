import { memo } from 'react';
import { CELL_SIZE_MM, GRID_COLS, GRID_ROWS, type PlacedPuzzle } from '../types/puzzle';
import { getPuzzleDefinition } from './puzzles';
import styles from './PagePreview.module.css';

interface PagePreviewProps {
  puzzles: PlacedPuzzle[];
  /** Screen width of the sheet, in px */
  width: number;
}

// The sheet's width on screen at 100%: CSS's 96px to the inch
const SHEET_WIDTH_PX = (GRID_COLS * CELL_SIZE_MM * 96) / 25.4;

/** A saved page drawn small: the real puzzles, laid out in mm, then zoomed down. */
function PagePreview({ puzzles, width }: PagePreviewProps) {
  return (
    <div
      className={styles.sheet}
      style={{
        width: `${GRID_COLS * CELL_SIZE_MM}mm`,
        height: `${GRID_ROWS * CELL_SIZE_MM}mm`,
        zoom: width / SHEET_WIDTH_PX,
      }}
      aria-hidden="true"
    >
      {puzzles.map(puzzle => {
        const definition = getPuzzleDefinition(puzzle.type);
        if (!definition) return null;
        // Cast needed: registry aggregates heterogeneous puzzle types
        const Component = definition.component as React.ComponentType<{
          gridWidth: number;
          gridHeight: number;
          seed: number;
          config: unknown;
        }>;
        return (
          <div
            key={puzzle.id}
            className={styles.puzzle}
            style={{
              left: `${puzzle.x * CELL_SIZE_MM}mm`,
              top: `${puzzle.y * CELL_SIZE_MM}mm`,
              width: `${puzzle.width * CELL_SIZE_MM}mm`,
              height: `${puzzle.height * CELL_SIZE_MM}mm`,
            }}
          >
            <Component
              gridWidth={puzzle.width}
              gridHeight={puzzle.height}
              seed={puzzle.seed}
              config={puzzle.config ?? definition.defaultConfig}
            />
          </div>
        );
      })}
    </div>
  );
}

export default memo(PagePreview);
