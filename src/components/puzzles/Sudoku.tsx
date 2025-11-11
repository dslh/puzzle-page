import { useMemo } from 'react';
import { generateSudoku, type Sudoku as SudokuType } from '../../utils/sudokuGenerator';
import { getSymbolSet, type SymbolSet } from '../../utils/symbolSets';
import styles from './Sudoku.module.css';

interface SudokuProps {
  seed?: number;
  symbolSetIndex?: number;
}

export default function Sudoku({ seed = 0, symbolSetIndex = 0 }: SudokuProps) {
  const puzzle: SudokuType = useMemo(() => {
    return generateSudoku(seed);
  }, [seed]);

  const symbolSet: SymbolSet = useMemo(() => {
    return getSymbolSet(symbolSetIndex);
  }, [symbolSetIndex]);

  return (
    <div className={styles.sudokuContainer}>
      <h2 className={styles.sudokuTitle}>Picture Sudoku</h2>
      <p className={styles.instructions}>
        Fill the grid so each {symbolSet.name.toLowerCase()} appears once in every row and column!
      </p>
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
                {cell.isGiven ? symbolSet.symbols[cell.value] : ''}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
