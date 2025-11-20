import { CELL_SIZE_MM } from '../types/puzzle';
import type { PlacedPuzzle } from '../types/puzzle';
import { getPuzzleDefinition } from './puzzles';
import styles from './PuzzleWrapper.module.css';

interface PuzzleWrapperProps {
  puzzle: PlacedPuzzle;
  onRemove?: (id: string) => void;
  onReroll?: (id: string) => void;
  onResize?: (id: string, width: number, height: number) => void;
  onConfigChange?: (id: string, config: unknown) => void;
}

export default function PuzzleWrapper({ puzzle, onRemove, onReroll, onResize, onConfigChange }: PuzzleWrapperProps) {
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
    // Map legacy sudoku4x4 type to sudoku3x3 definition
    const lookupType = puzzle.type === 'sudoku4x4' ? 'sudoku3x3' : puzzle.type;
    const definition = getPuzzleDefinition(lookupType);

    if (!definition) {
      console.error(`Unknown puzzle type: ${puzzle.type}`);
      return null;
    }

    const Component = definition.component as React.ComponentType<any>;

    // Use puzzle's stored config, fallback to definition default
    // Special case: legacy sudoku4x4 gets size: 4 config
    const config = puzzle.config !== undefined
      ? puzzle.config
      : puzzle.type === 'sudoku4x4'
      ? { size: 4 as const }
      : definition.defaultConfig;

    return (
      <Component
        gridWidth={puzzle.width}
        gridHeight={puzzle.height}
        seed={puzzle.seed}
        config={config}
      />
    );
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

      {/* Config UI */}
      {puzzleDef?.configComponent && onConfigChange && (
        <div className={styles.configPanel}>
          {(() => {
            const ConfigComponent = puzzleDef.configComponent as React.ComponentType<any>;
            const currentConfig = puzzle.config ?? puzzleDef.defaultConfig;
            return (
              <ConfigComponent
                value={(currentConfig as any)?.size ?? 3}
                onChange={(size: number) => {
                  onConfigChange(puzzle.id, { size });
                }}
              />
            );
          })()}
        </div>
      )}

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
