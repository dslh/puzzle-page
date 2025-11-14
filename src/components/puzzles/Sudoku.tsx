import { useMemo } from 'react';
import { generateSudoku, type Sudoku as SudokuType } from '../../utils/sudokuGenerator';
import { getSymbols, getModeName, type SudokuConfig } from '../../utils/symbolSets';
import styles from './Sudoku.module.css';

interface SudokuProps {
  seed?: number;
  config: SudokuConfig;
}

export default function Sudoku({ seed = 0, config }: SudokuProps) {
  const puzzle: SudokuType = useMemo(() => {
    return generateSudoku(seed);
  }, [seed]);

  const symbols = useMemo(() => {
    return getSymbols(config);
  }, [config]);

  const modeName = useMemo(() => {
    return getModeName(config);
  }, [config]);

  const renderSymbol = (symbol: string) => {
    if (config.mode === 'colours') {
      return (
        <div
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            backgroundColor: symbol,
            border: '2px solid #333',
          }}
        />
      );
    }

    if (config.mode === 'shapes') {
      const size = 30;
      switch (symbol) {
        case 'circle':
          return (
            <svg width={size} height={size} viewBox="0 0 30 30">
              <circle cx="15" cy="15" r="12" fill="none" stroke="#333" strokeWidth="2" />
            </svg>
          );
        case 'square':
          return (
            <svg width={size} height={size} viewBox="0 0 30 30">
              <rect x="3" y="3" width="24" height="24" fill="none" stroke="#333" strokeWidth="2" />
            </svg>
          );
        case 'triangle':
          return (
            <svg width={size} height={size} viewBox="0 0 30 30">
              <polygon points="15,3 27,27 3,27" fill="none" stroke="#333" strokeWidth="2" />
            </svg>
          );
        case 'cross':
          return (
            <svg width={size} height={size} viewBox="0 0 30 30">
              <line x1="5" y1="5" x2="25" y2="25" stroke="#333" strokeWidth="2" />
              <line x1="25" y1="5" x2="5" y2="25" stroke="#333" strokeWidth="2" />
            </svg>
          );
      }
    }

    // characters mode
    return <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{symbol}</span>;
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
                {cell.isGiven ? renderSymbol(symbols[cell.value]) : ''}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
