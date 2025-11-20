import { useState } from 'react';
import type { DragEvent } from 'react';
import { GRID_COLS, GRID_ROWS, CELL_SIZE_MM } from '../types/puzzle';
import type { PlacedPuzzle, PuzzleType } from '../types/puzzle';
import { getPuzzleDefinition } from './puzzles';
import PuzzleWrapper from './PuzzleWrapper';
import styles from './GridLayout.module.css';

interface GridLayoutProps {
  puzzles: PlacedPuzzle[];
  onAddPuzzle: (puzzle: PlacedPuzzle) => void;
  onRemovePuzzle?: (id: string) => void;
  onRerollPuzzle?: (id: string) => void;
  onUpdatePuzzle?: (id: string, x: number, y: number) => void;
  onResizePuzzle?: (id: string, width: number, height: number) => void;
  onConfigChange?: (id: string, config: unknown) => void;
}

interface DragState {
  type: string;
  width: number;
  height: number;
  puzzleId?: string; // If present, we're moving an existing puzzle
  config?: unknown; // Optional config from sidebar
}

export default function GridLayout({ puzzles, onAddPuzzle, onRemovePuzzle, onRerollPuzzle, onUpdatePuzzle, onResizePuzzle, onConfigChange }: GridLayoutProps) {
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
        const parts = type.split('/');
        const puzzleType = parts[1];
        const width = parseInt(parts[2]);
        const height = parseInt(parts[3]);

        // parts[4] is always puzzleId (may be empty string or undefined)
        // parts[5] is always config (if present)
        const puzzleId = parts[4] || undefined;
        let config: unknown = undefined;

        if (parts[5]) {
          try {
            config = JSON.parse(decodeURIComponent(parts[5]));
          } catch (e) {
            console.error('Failed to parse config from drag data:', e);
          }
        }

        setDragData({ type: puzzleType, width, height, puzzleId, config });
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

    // Exclude the puzzle being moved from collision detection
    const hasCollision = checkCollision(
      dragOver.x,
      dragOver.y,
      dragData.width,
      dragData.height,
      dragData.puzzleId
    );

    if (!hasCollision) {
      if (dragData.puzzleId && onUpdatePuzzle) {
        // Moving an existing puzzle
        onUpdatePuzzle(dragData.puzzleId, dragOver.x, dragOver.y);
      } else {
        // Adding a new puzzle from sidebar
        const definition = getPuzzleDefinition(dragData.type);
        const newPuzzle: PlacedPuzzle = {
          id: `${dragData.type}-${Date.now()}-${Math.random()}`,
          type: dragData.type as PuzzleType,
          x: dragOver.x,
          y: dragOver.y,
          seed: Date.now() + Math.floor(Math.random() * 1000),
          width: dragData.width,
          height: dragData.height,
          config: dragData.config ?? definition?.defaultConfig,
        };

        onAddPuzzle(newPuzzle);
      }
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
            const hasCollision = checkCollision(
              dragOver.x,
              dragOver.y,
              dragData.width,
              dragData.height,
              dragData.puzzleId
            );
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
        {puzzles
          .filter(puzzle => !dragData?.puzzleId || puzzle.id !== dragData.puzzleId)
          .map(puzzle => (
            <PuzzleWrapper
              key={puzzle.id}
              puzzle={puzzle}
              onRemove={onRemovePuzzle}
              onReroll={onRerollPuzzle}
              onResize={onResizePuzzle}
              onConfigChange={onConfigChange}
            />
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
