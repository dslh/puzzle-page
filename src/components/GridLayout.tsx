import { useEffect, useRef, useState } from 'react';
import type { DragEvent, PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import { GRID_COLS, GRID_ROWS, CELL_SIZE_MM } from '../types/puzzle';
import type { PlacedPuzzle } from '../types/puzzle';
import { getPuzzleDefinition } from './puzzles';
import { collides, fitAtCell, newPlacedPuzzle } from '../utils/placement';
import { trackPointerDrag } from '../utils/pointerDrag';
import { EXIT_MS } from '../utils/motion';
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
  /** Shown on the sheet while it has no puzzles; not printed */
  emptyPrompt?: ReactNode;
}

// The sheet's width on screen at 100%: CSS's 96px to the inch
const SHEET_WIDTH_PX = (GRID_COLS * CELL_SIZE_MM * 96) / 25.4;

// A new puzzle being dragged in from the sidebar (HTML5 drag and drop)
interface DragState {
  type: string;
  width: number;
  height: number;
}

// A placed puzzle being moved (pointer events), and where it would land
interface MoveState {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

// Where a dragged puzzle would land, for the cell highlight and preview
interface Ghost {
  x: number;
  y: number;
  width: number;
  height: number;
  excludeId?: string;
}

export default function GridLayout({ puzzles, onAddPuzzle, onRemovePuzzle, onRerollPuzzle, onUpdatePuzzle, onResizePuzzle, onConfigChange, selectedId, onSelect, emptyPrompt }: GridLayoutProps) {
  const [dragOver, setDragOver] = useState<{ x: number; y: number } | null>(null);
  const [dragData, setDragData] = useState<DragState | null>(null);
  const [move, setMove] = useState<MoveState | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const { dragConfig, setDragConfig } = useDragConfig();

  // Puzzles already there when the page first draws just appear; any added
  // after that are laid onto the sheet
  const drawn = useRef(false);
  useEffect(() => {
    drawn.current = true;
  }, []);

  // Puzzles just removed (one, or the whole page), still drawn while they
  // fade out. The page itself has already dropped them, so Undo, Print and
  // saving never wait on the animation. One that comes back (Undo) is drawn
  // from the page again, and lands with the usual entrance.
  const [leaving, setLeaving] = useState<PlacedPuzzle[]>([]);
  const [lastPuzzles, setLastPuzzles] = useState(puzzles);
  if (puzzles !== lastPuzzles) {
    setLastPuzzles(puzzles);
    const ids = new Set(puzzles.map(p => p.id));
    const gone = lastPuzzles.filter(p => !ids.has(p.id));
    if (gone.length > 0 || leaving.some(p => ids.has(p.id))) {
      setLeaving([...leaving.filter(p => !ids.has(p.id)), ...gone]);
    }
  }
  useEffect(() => {
    if (leaving.length === 0) return;
    const timer = setTimeout(() => setLeaving([]), EXIT_MS + 50);
    return () => clearTimeout(timer);
  }, [leaving]);

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

  // The grid cell under a point on screen. Measured from the sheet as drawn,
  // so it holds at any zoom.
  const cellAt = (clientX: number, clientY: number) => {
    const rect = gridRef.current!.getBoundingClientRect();
    return {
      x: Math.floor((clientX - rect.left) / (rect.width / GRID_COLS)),
      y: Math.floor((clientY - rect.top) / (rect.height / GRID_ROWS)),
    };
  };

  // Moving a placed puzzle: from its drag handle with a mouse, or by dragging
  // the selected puzzle itself on a touch screen. The puzzle keeps the cell
  // that was grabbed under the pointer, and stays on the page.
  const handleMoveStart = (puzzle: PlacedPuzzle, e: ReactPointerEvent) => {
    const grabbed = cellAt(e.clientX, e.clientY);
    const offsetX = Math.min(Math.max(grabbed.x - puzzle.x, 0), puzzle.width - 1);
    const offsetY = Math.min(Math.max(grabbed.y - puzzle.y, 0), puzzle.height - 1);
    let target: { x: number; y: number } | null = null;

    trackPointerDrag(e, {
      onMove: moveEvent => {
        const cell = cellAt(moveEvent.clientX, moveEvent.clientY);
        target = {
          x: Math.min(Math.max(cell.x - offsetX, 0), GRID_COLS - puzzle.width),
          y: Math.min(Math.max(cell.y - offsetY, 0), GRID_ROWS - puzzle.height),
        };
        setMove({ id: puzzle.id, ...target, width: puzzle.width, height: puzzle.height });
      },
      onEnd: endEvent => {
        if (endEvent && target && onUpdatePuzzle
          && !checkCollision(target.x, target.y, puzzle.width, puzzle.height, puzzle.id)) {
          onUpdatePuzzle(puzzle.id, target.x, target.y);
        }
        setMove(null);
      },
    });
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

        setDragData({ type: puzzleType, width, height });
      }
      return;
    }

    setDragOver(cellAt(e.clientX, e.clientY));
  };

  const handleDragLeave = () => {
    setDragOver(null);
    setDragData(null);
  };

  // Where a puzzle dragged in from the sidebar would land: over the cell
  // under the pointer, shrunk if need be to fit the space there
  const dropSpot = dragOver && dragData
    ? fitAtCell(puzzles, dragOver, dragData.width, dragData.height,
      getPuzzleDefinition(dragData.type)?.resizable)
    : null;

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (dropSpot && dragData) {
      const definition = getPuzzleDefinition(dragData.type);

      // Get config from context if available, otherwise use definition default
      const fromSidebar = dragConfig?.puzzleType === dragData.type ? dragConfig : null;
      const config = fromSidebar ? fromSidebar.config : definition?.defaultConfig;

      onAddPuzzle(newPlacedPuzzle(
        dragData.type, dropSpot.x, dropSpot.y, dropSpot.width, dropSpot.height, config,
        fromSidebar?.entryKey,
      ));
    }

    setDragOver(null);
    setDragData(null);
    setDragConfig(null);
  };

  const ghost: Ghost | null = move
    ? { ...move, excludeId: move.id }
    : dropSpot ?? (dragOver && dragData
      ? { ...dragOver, width: dragData.width, height: dragData.height }
      : null);
  const ghostCollides = ghost !== null
    && checkCollision(ghost.x, ghost.y, ghost.width, ghost.height, ghost.excludeId);

  const renderGridCells = () => {
    const cells = [];
    for (let y = 0; y < GRID_ROWS; y++) {
      for (let x = 0; x < GRID_COLS; x++) {
        let className = styles.gridCell;

        // Highlight cells under drag
        if (ghost) {
          const isUnderDrag =
            x >= ghost.x &&
            x < ghost.x + ghost.width &&
            y >= ghost.y &&
            y < ghost.y + ghost.height;

          if (isUnderDrag) {
            className += ghostCollides ? ` ${styles.invalid}` : ` ${styles.valid}`;
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
        ref={gridRef}
        className={styles.grid}
        style={{
          width: `${GRID_COLS * CELL_SIZE_MM}mm`,
          height: `${GRID_ROWS * CELL_SIZE_MM}mm`,
          '--sheet-scale': scale,
        } as React.CSSProperties}
      >
        {renderGridCells()}

        {puzzles.length === 0 && leaving.length === 0 && !dragData && emptyPrompt && (
          <div className={styles.empty}>{emptyPrompt}</div>
        )}

        {/* Render placed puzzles */}
        {puzzles.map(puzzle => (
          <PuzzleWrapper
            key={puzzle.id}
            puzzle={puzzle}
            onRemove={onRemovePuzzle}
            onReroll={onRerollPuzzle}
            onResize={onResizePuzzle}
            onConfigChange={onConfigChange}
            onMoveStart={onUpdatePuzzle && handleMoveStart}
            moving={puzzle.id === move?.id}
            selected={puzzle.id === selectedId}
            onSelect={onSelect}
            animateIn={drawn.current}
          />
        ))}

        {leaving.map(puzzle => (
          <PuzzleWrapper key={puzzle.id} puzzle={puzzle} leaving />
        ))}

        {/* Drag preview */}
        {ghost && (
          <div
            className={styles.dragPreview}
            style={{
              left: `${ghost.x * CELL_SIZE_MM}mm`,
              top: `${ghost.y * CELL_SIZE_MM}mm`,
              width: `${ghost.width * CELL_SIZE_MM}mm`,
              height: `${ghost.height * CELL_SIZE_MM}mm`,
            }}
          />
        )}
      </div>
    </div>
  );
}
