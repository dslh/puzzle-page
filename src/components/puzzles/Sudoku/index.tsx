import { useMemo } from 'react';
import { generateSudoku, type Sudoku as SudokuType } from './generator';
import styles from './Sudoku.module.css';

const COLORS = ['red', 'green', 'blue', 'yellow'] as const;

interface SudokuProps {
  seed?: number;
}

export default function Sudoku({ seed = 0 }: SudokuProps) {
  const puzzle: SudokuType = useMemo(() => {
    return generateSudoku(seed);
  }, [seed]);

  const renderColor = (colorIndex: number) => {
    return (
      <div
        className={styles.colorCircle}
        style={{
          backgroundColor: COLORS[colorIndex],
        }}
      />
    );
  };

  return (
    <div className={styles.sudokuContainer}>
      <div className={styles.sudokuGrid}>
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
