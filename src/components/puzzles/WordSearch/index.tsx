import { useMemo } from 'react';
import { generateWordSearch } from './generator';
import type { PuzzleProps } from '../../../types/puzzle';
import styles from './WordSearch.module.css';

export interface WordSearchConfig {
  difficulty: 1 | 2 | 3 | 4;
  wordCount: 3 | 4 | 5;
  limitedLetters: boolean;
  customWordsText?: string;
}

const GRID_CELL_PX = 72; // 19mm at 96 DPI

// Calculate internal grid size based on allocated puzzle space
function calculateGridSize(gridWidth: number, gridHeight: number): number {
  // Use smaller dimension, leaving 1 cell worth of space for clues
  const size = Math.min(gridWidth, gridHeight - 1);
  // Clamp to reasonable bounds: 5 (easy) to 9 (challenging)
  return Math.max(5, Math.min(9, size));
}

export default function WordSearch({
  gridWidth,
  gridHeight,
  seed,
  config,
}: PuzzleProps<WordSearchConfig>) {
  const difficulty = config?.difficulty ?? 1;
  const wordCount = config?.wordCount ?? 3;
  const limitedLetters = config?.limitedLetters ?? false;
  const customWordsText = config?.customWordsText ?? '';

  // Calculate internal grid size based on puzzle dimensions
  const internalGridSize = calculateGridSize(gridWidth, gridHeight);

  const puzzle = useMemo(
    () => generateWordSearch(seed, difficulty, wordCount, internalGridSize, limitedLetters, customWordsText),
    [seed, difficulty, wordCount, internalGridSize, limitedLetters, customWordsText]
  );

  // Calculate cell size based on available grid space
  const availableWidth = gridWidth * GRID_CELL_PX;
  const availableHeight = gridHeight * GRID_CELL_PX;

  // Reserve space for clue list (bottom portion)
  const clueAreaHeight = Math.min(80, availableHeight * 0.2);
  const gridAreaHeight = availableHeight - clueAreaHeight - 16;

  const cellSize = Math.min(
    Math.floor((availableWidth - 8) / puzzle.gridSize),
    Math.floor(gridAreaHeight / puzzle.gridSize)
  );

  return (
    <div className={styles.container}>
      <div
        className={styles.grid}
        style={{
          gridTemplateColumns: `repeat(${puzzle.gridSize}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${puzzle.gridSize}, ${cellSize}px)`,
        }}
      >
        {puzzle.grid.map((row, y) =>
          row.map((letter, x) => (
            <div
              key={`${x}-${y}`}
              className={styles.cell}
              style={{ fontSize: `${Math.floor(cellSize * 0.6)}px` }}
            >
              {letter}
            </div>
          ))
        )}
      </div>

      <div className={styles.clueList}>
        {puzzle.words.map((placedWord, index) => (
          <div key={index} className={styles.clue}>
            <span className={styles.clueEmoji}>{placedWord.emoji}</span>
            <span className={styles.clueWord}>{placedWord.word}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
