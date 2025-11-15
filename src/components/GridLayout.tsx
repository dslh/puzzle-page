import { useState } from 'react';
import type { DragEvent } from 'react';
import { GRID_COLS, GRID_ROWS, CELL_SIZE_MM } from '../types/puzzle';
import type { PlacedPuzzle } from '../types/puzzle';
import PuzzleWrapper from './PuzzleWrapper';
import styles from './GridLayout.module.css';

interface GridLayoutProps {
  puzzles: PlacedPuzzle[];
  onAddPuzzle: (puzzle: PlacedPuzzle) => void;
  onRemovePuzzle?: (id: string) => void;
}

interface DragState {
  type: string;
  width: number;
  height: number;
}

export default function GridLayout({ puzzles, onAddPuzzle, onRemovePuzzle }: GridLayoutProps) {
  const [dragOver, setDragOver] = useState<{ x: number; y: number } | null>(null);
  const [dragData, setDragData] = useState<DragState | null>(null);

  const checkCollision = (x: number, y: number, width: number, height: number, excludeId?: string): boolean => {
    // Check if puzzle would go out of bounds
    if (x + width > GRID_COLS || y + height > GRID_ROWS) {
      return true;
    }

    // Check collision with existing puzzles
    for (const puzzle of puzzles) {
      if (puzzle.id === excludeId) continue;

      const xOverlap = x < puzzle.x + puzzle.width && x + width > puzzle.x;
      const yOverlap = y < puzzle.y + puzzle.height && y + height > puzzle.y;

      if (xOverlap && yOverlap) {
        return true;
      }
    }

    return false;
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (!dragData) {
      const type = e.dataTransfer.types.find(t => t.startsWith('puzzle/'));
      if (type) {
        const [, puzzleType, width, height] = type.split('/');
        setDragData({ type: puzzleType, width: parseInt(width), height: parseInt(height) });
      }
      return;
    }

    // Get the actual grid element's position, not the container
    const gridElement = e.currentTarget.querySelector(`.${styles.grid}`) as HTMLElement;
    if (!gridElement) return;

    const rect = gridElement.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / (rect.width / GRID_COLS));
    const y = Math.floor((e.clientY - rect.top) / (rect.height / GRID_ROWS));

    setDragOver({ x, y });
  };

  const handleDragLeave = () => {
    setDragOver(null);
    setDragData(null);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (!dragOver || !dragData) return;

    const hasCollision = checkCollision(dragOver.x, dragOver.y, dragData.width, dragData.height);

    if (!hasCollision) {
      const newPuzzle: PlacedPuzzle = {
        id: `${dragData.type}-${Date.now()}-${Math.random()}`,
        type: dragData.type as 'maze' | 'sudoku',
        x: dragOver.x,
        y: dragOver.y,
        seed: Date.now() + Math.floor(Math.random() * 1000),
        width: dragData.width,
        height: dragData.height,
      };

      onAddPuzzle(newPuzzle);
    }

    setDragOver(null);
    setDragData(null);
  };

  const renderGridCells = () => {
    const cells = [];
    for (let y = 0; y < GRID_ROWS; y++) {
      for (let x = 0; x < GRID_COLS; x++) {
        let className = styles.gridCell;

        // Highlight cells under drag
        if (dragOver && dragData) {
          const isUnderDrag =
            x >= dragOver.x &&
            x < dragOver.x + dragData.width &&
            y >= dragOver.y &&
            y < dragOver.y + dragData.height;

          if (isUnderDrag) {
            const hasCollision = checkCollision(dragOver.x, dragOver.y, dragData.width, dragData.height);
            className += hasCollision ? ` ${styles.invalid}` : ` ${styles.valid}`;
          }
        }

        cells.push(
          <div
            key={`${x}-${y}`}
            className={className}
            style={{
              left: `${x * CELL_SIZE_MM}mm`,
              top: `${y * CELL_SIZE_MM}mm`,
              width: `${CELL_SIZE_MM}mm`,
              height: `${CELL_SIZE_MM}mm`,
            }}
          />
        );
      }
    }
    return cells;
  };

  return (
    <div
      className={styles.gridContainer}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        className={styles.grid}
        style={{
          width: `${GRID_COLS * CELL_SIZE_MM}mm`,
          height: `${GRID_ROWS * CELL_SIZE_MM}mm`,
        }}
      >
        {renderGridCells()}

        {/* Render placed puzzles */}
        {puzzles.map(puzzle => (
          <PuzzleWrapper key={puzzle.id} puzzle={puzzle} onRemove={onRemovePuzzle} />
        ))}

        {/* Drag preview */}
        {dragOver && dragData && (
          <div
            className={styles.dragPreview}
            style={{
              left: `${dragOver.x * CELL_SIZE_MM}mm`,
              top: `${dragOver.y * CELL_SIZE_MM}mm`,
              width: `${dragData.width * CELL_SIZE_MM}mm`,
              height: `${dragData.height * CELL_SIZE_MM}mm`,
            }}
          />
        )}
      </div>
    </div>
  );
}
