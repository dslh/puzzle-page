import { useMemo } from 'react';
import { generateSudoku, type Sudoku as SudokuType } from './generator';
import type { PuzzleProps } from '../../../types/puzzle';
import styles from './Sudoku.module.css';

const COLOR_SETS = {
  3: ['red', 'green', 'blue'] as const,
  4: ['red', 'green', 'blue', 'yellow'] as const,
  5: ['red', 'green', 'blue', 'yellow', 'pink'] as const,
};

const NUMBER_SYMBOLS = ['1', '2', '3', '4', '5'];
const LETTER_SYMBOLS = ['A', 'B', 'C', 'D', 'E'];

export interface SudokuConfig {
  size: 3 | 4 | 5;
  symbolType?: 'colors' | 'numbers' | 'letters' | 'custom';
  customSymbols?: string;
}

export default function Sudoku({ seed = 0, config }: PuzzleProps<SudokuConfig>) {
  const size = config?.size ?? 3;
  const symbolType = config?.symbolType ?? 'colors';
  const customSymbols = config?.customSymbols ?? '';

  const puzzle: SudokuType = useMemo(() => {
    return generateSudoku(size, seed);
  }, [size, seed]);

  const colors = COLOR_SETS[size as keyof typeof COLOR_SETS];

  const getSymbol = (index: number): string => {
    switch (symbolType) {
      case 'numbers':
        return NUMBER_SYMBOLS[index] ?? String(index + 1);
      case 'letters':
        return LETTER_SYMBOLS[index] ?? String.fromCharCode(65 + index);
      case 'custom':
        return customSymbols[index] ?? String(index + 1);
      default:
        return '';
    }
  };

  const renderCell = (valueIndex: number) => {
    if (symbolType === 'colors') {
      return (
        <div
          className={styles.colorCircle}
          style={{
            backgroundColor: colors[valueIndex],
          }}
        />
      );
    }
    return <span className={styles.symbol}>{getSymbol(valueIndex)}</span>;
  };

  // Calculate cell size based on grid size to maintain reasonable dimensions
  const cellSize = size === 3 ? 50 : size === 4 ? 45 : 38;

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
                {cell.isGiven ? renderCell(cell.value) : ''}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
