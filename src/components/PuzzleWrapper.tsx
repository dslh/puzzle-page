import { CELL_SIZE_MM, getPuzzleDefinition } from '../types/puzzle';
import type { PlacedPuzzle } from '../types/puzzle';
import Maze from './puzzles/Maze';
import Sudoku from './puzzles/Sudoku';
import WhichDoesntBelong from './puzzles/WhichDoesntBelong';
import PatternSequence from './puzzles/PatternSequence';
import Matching from './puzzles/Matching';
import styles from './PuzzleWrapper.module.css';

interface PuzzleWrapperProps {
  puzzle: PlacedPuzzle;
  onRemove?: (id: string) => void;
  onReroll?: (id: string) => void;
  onResize?: (id: string, width: number, height: number) => void;
}

export default function PuzzleWrapper({ puzzle, onRemove, onReroll, onResize }: PuzzleWrapperProps) {
  const puzzleDef = getPuzzleDefinition(puzzle.type);
  const resizable = puzzleDef?.resizable;

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    // Pass puzzle ID to indicate we're moving an existing puzzle
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData(`puzzle/${puzzle.type}/${puzzle.width}/${puzzle.height}/${puzzle.id}`, '');
  };

  const handleResizeStart = (e: React.MouseEvent, direction: 'right' | 'bottom' | 'corner') => {
    e.stopPropagation();
    e.preventDefault();

    if (!onResize || !resizable) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = puzzle.width;
    const startHeight = puzzle.height;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      // Calculate how many grid cells we've moved
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      // Convert pixel delta to grid cells (approximate, will be refined by grid snapping)
      // Using rough estimate: each grid cell is about 19mm ≈ 72px at 96 DPI
      const cellSizePx = 72;
      const deltaCellsX = Math.round(deltaX / cellSizePx);
      const deltaCellsY = Math.round(deltaY / cellSizePx);

      let newWidth = startWidth;
      let newHeight = startHeight;

      if (direction === 'right' || direction === 'corner') {
        if (resizable.width) {
          newWidth = Math.max(
            resizable.minWidth || 1,
            Math.min(resizable.maxWidth || 10, startWidth + deltaCellsX)
          );
        }
      }

      if (direction === 'bottom' || direction === 'corner') {
        if (resizable.height) {
          newHeight = Math.max(
            resizable.minHeight || 1,
            Math.min(resizable.maxHeight || 14, startHeight + deltaCellsY)
          );
        }
      }

      // Only update if size changed
      if (newWidth !== puzzle.width || newHeight !== puzzle.height) {
        onResize(puzzle.id, newWidth, newHeight);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const renderPuzzle = () => {
    switch (puzzle.type) {
      case 'maze':
        return <Maze gridWidth={puzzle.width} gridHeight={puzzle.height} seed={puzzle.seed} />;
      case 'sudoku3x3':
        return <Sudoku size={3} seed={puzzle.seed} />;
      case 'sudoku4x4':
        return <Sudoku size={4} seed={puzzle.seed} />;
      case 'whichdoesntbelong':
        return <WhichDoesntBelong gridHeight={puzzle.height} seed={puzzle.seed} />;
      case 'patternsequence':
        return <PatternSequence gridHeight={puzzle.height} seed={puzzle.seed} />;
      case 'matching':
        return <Matching gridHeight={puzzle.height} seed={puzzle.seed} />;
      default:
        return null;
    }
  };

  return (
    <div
      className={styles.wrapper}
      style={{
        left: `${puzzle.x * CELL_SIZE_MM}mm`,
        top: `${puzzle.y * CELL_SIZE_MM}mm`,
        width: `${puzzle.width * CELL_SIZE_MM}mm`,
        height: `${puzzle.height * CELL_SIZE_MM}mm`,
      }}
    >
      <div
        className={styles.dragHandle}
        draggable
        onDragStart={handleDragStart}
        title="Drag to reposition"
      >
        ⋮⋮
      </div>
      <div className={styles.buttonGroup}>
        {onReroll && (
          <button
            className={styles.rerollButton}
            onClick={() => onReroll(puzzle.id)}
            title="Re-roll puzzle"
          >
            🎲
          </button>
        )}
        {onRemove && (
          <button
            className={styles.deleteButton}
            onClick={() => onRemove(puzzle.id)}
            title="Remove puzzle"
          >
            ×
          </button>
        )}
      </div>
      <div className={styles.content}>{renderPuzzle()}</div>

      {/* Resize handles */}
      {resizable && onResize && (
        <>
          {resizable.width && (
            <div
              className={styles.resizeHandleRight}
              onMouseDown={(e) => handleResizeStart(e, 'right')}
              title="Resize width"
            />
          )}
          {resizable.height && (
            <div
              className={styles.resizeHandleBottom}
              onMouseDown={(e) => handleResizeStart(e, 'bottom')}
              title="Resize height"
            />
          )}
          {resizable.width && resizable.height && (
            <div
              className={styles.resizeHandleCorner}
              onMouseDown={(e) => handleResizeStart(e, 'corner')}
              title="Resize both"
            />
          )}
        </>
      )}
    </div>
  );
}
