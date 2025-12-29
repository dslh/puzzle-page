import { useMemo } from 'react';
import { generateOddOneOut } from './generator';
import type { PuzzleProps } from '../../../types/puzzle';
import { CELL_SIZE_MM } from '../../../types/puzzle';
import styles from './OddOneOut.module.css';

export interface OddOneOutConfig {
  size: 3 | 5 | 7;
}

// Simple seeded random for jiggle offsets
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
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

  // Max jiggle as percentage of cell size - more jiggle for smaller grids
  const jiggleAmount = size === 3 ? 35 : size === 5 ? 25 : 18;

  // Generate jiggle offsets for each cell
  const jiggleOffsets = useMemo(() => {
    const offsets: { x: number; y: number }[] = [];
    for (let i = 0; i < size * size; i++) {
      const xJiggle = (seededRandom(seed + i * 2) - 0.5) * 2 * jiggleAmount;
      const yJiggle = (seededRandom(seed + i * 2 + 1) - 0.5) * 2 * jiggleAmount;
      offsets.push({ x: xJiggle, y: yJiggle });
    }
    return offsets;
  }, [seed, size]);

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
          row.map((emoji, colIndex) => {
            const cellIndex = rowIndex * size + colIndex;
            const jiggle = jiggleOffsets[cellIndex];
            return (
              <div key={`${rowIndex}-${colIndex}`} className={styles.cell}>
                <span
                  style={{
                    transform: `translate(${jiggle.x}%, ${jiggle.y}%)`,
                    display: 'inline-block',
                  }}
                >
                  {emoji}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
