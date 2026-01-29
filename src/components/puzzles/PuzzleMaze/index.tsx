import { useMemo } from 'react';
import type { PuzzleProps } from '../../../types/puzzle';
import { CELL_SIZE_MM } from '../../../types/puzzle';
import { generatePuzzleMaze, ALL_DIRECTIONS, type Direction, type EmojiMode } from './generator';
import styles from './PuzzleMaze.module.css';

export interface PuzzleMazeConfig {
  emojiMode: EmojiMode;
}

function getArrowEmoji(dir: Direction): string {
  switch (dir) {
    case 'up': return '⬆️';
    case 'down': return '⬇️';
    case 'left': return '⬅️';
    case 'right': return '➡️';
  }
}

export default function PuzzleMaze({ gridWidth, gridHeight, seed, config }: PuzzleProps<PuzzleMazeConfig>) {
  const emojiMode = config?.emojiMode ?? 'random';

  // Double the grid dimensions for more cells; subtract 1 row for the legend
  const cols = gridWidth * 2;
  const rows = gridHeight * 2 - 1;

  const puzzleData = useMemo(
    () => generatePuzzleMaze(cols, rows, seed, emojiMode),
    [cols, rows, seed, emojiMode]
  );

  const { grid, startX, endX, emojis } = puzzleData;

  const totalHeight = gridHeight * CELL_SIZE_MM;
  const totalWidth = gridWidth * CELL_SIZE_MM;
  const gridCellSize = CELL_SIZE_MM / 2;
  const emojiFontSize = gridCellSize * 0.7;

  return (
    <div className={styles.container} style={{ width: `${totalWidth}mm`, height: `${totalHeight}mm` }}>
      {/* Legend */}
      <div className={styles.legend}>
        {ALL_DIRECTIONS.map((dir) => (
          <div key={dir} className={styles.legendItem}>
            <span className={styles.legendEmoji}>{emojis[dir]}</span>
            <span className={styles.legendArrow}>{getArrowEmoji(dir)}</span>
          </div>
        ))}
      </div>

      {/* Entry arrow */}
      <div className={styles.entryArrow}>
        ⬇️
      </div>

      {/* Grid */}
      <div
        className={styles.grid}
        style={{
          width: `${cols * gridCellSize}mm`,
          height: `${rows * gridCellSize}mm`,
          gridTemplateColumns: `repeat(${cols}, ${gridCellSize}mm)`,
          gridTemplateRows: `repeat(${rows}, ${gridCellSize}mm)`,
        }}
      >
        {grid.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              className={styles.cell}
            >
              <span
                className={styles.emoji}
                style={{ fontSize: `${emojiFontSize}mm` }}
              >
                {emojis[cell.direction]}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Exit arrow */}
      <div className={styles.exitArrow}>
        ⬇️
      </div>
    </div>
  );
}
