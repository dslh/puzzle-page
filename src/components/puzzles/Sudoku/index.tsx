import { useMemo } from 'react';
import { generateSudoku, type Sudoku as SudokuType } from './generator';
import type { PuzzleProps } from '../../../types/puzzle';
import styles from './Sudoku.module.css';

const COLOR_SETS = {
  3: ['red', 'green', 'blue'] as const,
  4: ['red', 'green', 'blue', 'yellow'] as const,
};

export interface SudokuConfig {
  size: 3 | 4;
}

export default function Sudoku({ seed = 0, config }: PuzzleProps<SudokuConfig>) {
  const size = config?.size ?? 3;
  const puzzle: SudokuType = useMemo(() => {
    return generateSudoku(size, seed);
  }, [size, seed]);

  const colors = COLOR_SETS[size as keyof typeof COLOR_SETS];

  const renderColor = (colorIndex: number) => {
    return (
      <div
        className={styles.colorCircle}
        style={{
          backgroundColor: colors[colorIndex],
        }}
      />
    );
  };

  // Calculate cell size based on grid size to maintain reasonable dimensions
  const cellSize = size === 3 ? 50 : 45;

  return (
    <div className={styles.sudokuContainer}>
      <div
        className={styles.sudokuGrid}
        style={{
          gridTemplateColumns: `repeat(${size}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${size}, ${cellSize}px)`,
        }}
      >
        {puzzle.grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const cellClasses = [
              styles.cell,
              cell.isGiven ? styles.given : styles.empty,
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <div key={`${rowIndex}-${colIndex}`} className={cellClasses}>
                {cell.isGiven ? renderColor(cell.value) : ''}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
