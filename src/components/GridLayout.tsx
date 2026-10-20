import { useEffect, useRef, useState } from 'react';
import type { DragEvent } from 'react';
import { GRID_COLS, GRID_ROWS, CELL_SIZE_MM } from '../types/puzzle';
import type { PlacedPuzzle } from '../types/puzzle';
import { getPuzzleDefinition } from './puzzles';
import { collides, newPlacedPuzzle } from '../utils/placement';
import { useDragConfig } from '../contexts/DragConfigContext';
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
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
}

// The sheet's width on screen at 100%: CSS's 96px to the inch
const SHEET_WIDTH_PX = (GRID_COLS * CELL_SIZE_MM * 96) / 25.4;

interface DragState {
  type: string;
  width: number;
  height: number;
  puzzleId?: string; // If present, we're moving an existing puzzle
}

export default function GridLayout({ puzzles, onAddPuzzle, onRemovePuzzle, onRerollPuzzle, onUpdatePuzzle, onResizePuzzle, onConfigChange, selectedId, onSelect }: GridLayoutProps) {
  const [dragOver, setDragOver] = useState<{ x: number; y: number } | null>(null);
  const [dragData, setDragData] = useState<DragState | null>(null);
  const { dragConfig, setDragConfig } = useDragConfig();

  // Shrink the sheet to fit a narrow screen. Applied with CSS zoom on screen
  // only, so the printed page keeps its exact mm sizes.
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(([entry]) => {
      setScale(Math.min(1, entry.contentRect.width / SHEET_WIDTH_PX));
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const checkCollision = (x: number, y: number, width: number, height: number, excludeId?: string) =>
    collides(puzzles, x, y, width, height, excludeId);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (!dragData) {
      const type = e.dataTransfer.types.find(t => t.startsWith('puzzle/'));
      if (type) {
        const parts = type.split('/');
        const puzzleType = parts[1];
        const width = parseInt(parts[2]);
        const height = parseInt(parts[3]);
        const puzzleId = parts[4] || undefined;

        setDragData({ type: puzzleType, width, height, puzzleId });
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

        // Get config from context if available, otherwise use definition default
        const config = dragConfig?.puzzleType === dragData.type
          ? dragConfig.config
          : definition?.defaultConfig;

        onAddPuzzle(newPlacedPuzzle(
          dragData.type, dragOver.x, dragOver.y, dragData.width, dragData.height, config,
        ));
      }
    }

    setDragOver(null);
    setDragData(null);
    setDragConfig(null);
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
      ref={containerRef}
      className={styles.gridContainer}
      onClick={() => onSelect?.(null)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        className={styles.grid}
        style={{
          width: `${GRID_COLS * CELL_SIZE_MM}mm`,
          height: `${GRID_ROWS * CELL_SIZE_MM}mm`,
          '--sheet-scale': scale,
        } as React.CSSProperties}
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
              selected={puzzle.id === selectedId}
              onSelect={onSelect}
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
