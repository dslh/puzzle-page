import { useMemo } from 'react';
import { generateOddOneOut } from './generator';
import type { PuzzleProps } from '../../../types/puzzle';
import { CELL_SIZE_MM } from '../../../types/puzzle';
import styles from './OddOneOut.module.css';

export interface OddOneOutConfig {
  size: 3 | 5 | 7;
}

export default function OddOneOut({ gridWidth, gridHeight, seed, config }: PuzzleProps<OddOneOutConfig>) {
  const size = config?.size ?? 5;

  const puzzle = useMemo(() => {
    return generateOddOneOut(size, seed);
  }, [size, seed]);

  // Calculate cell size to fit within the allocated grid space
  // Use the smaller dimension to ensure it fits
  const availableWidth = gridWidth * CELL_SIZE_MM;
  const availableHeight = gridHeight * CELL_SIZE_MM;
  const availableSize = Math.min(availableWidth, availableHeight);

  // Leave some padding and calculate cell size in mm
  const padding = 2; // mm padding
  const cellSizeMm = (availableSize - padding * 2) / size;

  return (
    <div className={styles.container}>
      <div
        className={styles.grid}
        style={{
          gridTemplateColumns: `repeat(${size}, ${cellSizeMm}mm)`,
          gridTemplateRows: `repeat(${size}, ${cellSizeMm}mm)`,
        }}
      >
        {puzzle.grid.map((row, rowIndex) =>
          row.map((emoji, colIndex) => (
            <div key={`${rowIndex}-${colIndex}`} className={styles.cell}>
              {emoji}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
