import { useEffect, useRef } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { CELL_SIZE_MM } from '../types/puzzle';
import type { PlacedPuzzle } from '../types/puzzle';
import { getPuzzleDefinition } from './puzzles';
import HelpButton from './help/HelpButton';
import { trackPointerDrag } from '../utils/pointerDrag';
import styles from './PuzzleWrapper.module.css';

interface PuzzleWrapperProps {
  puzzle: PlacedPuzzle;
  onRemove?: (id: string) => void;
  onReroll?: (id: string) => void;
  onResize?: (id: string, width: number, height: number) => void;
  onConfigChange?: (id: string, config: unknown) => void;
  /** Starts moving this puzzle; GridLayout follows the pointer from here. */
  onMoveStart?: (puzzle: PlacedPuzzle, e: ReactPointerEvent) => void;
  /** Being moved: drawn faintly where it was until it lands. */
  moving?: boolean;
  selected?: boolean;
  onSelect?: (id: string | null) => void;
}

export default function PuzzleWrapper({ puzzle, onRemove, onReroll, onResize, onConfigChange, onMoveStart, moving, selected, onSelect }: PuzzleWrapperProps) {
  const puzzleDef = getPuzzleDefinition(puzzle.type);
  const resizable = puzzleDef?.resizable;

  // Bring a newly selected puzzle into view, e.g. one just added from the drawer
  const wrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (selected) wrapperRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selected]);

  // With a mouse, a puzzle moves by its drag handle
  const handleHandlePointerDown = (e: ReactPointerEvent) => {
    if (e.button !== 0 || !onMoveStart) return;
    e.stopPropagation();
    e.preventDefault();
    onMoveStart(puzzle, e);
  };

  // In the compact layout, the selected puzzle moves by dragging the puzzle
  // itself. Only the selected one, so a swipe across the others still
  // scrolls the page.
  const handlePointerDown = (e: ReactPointerEvent) => {
    if (e.button !== 0 || !selected || !onMoveStart) return;
    onMoveStart(puzzle, e);
  };

  const handleResizeStart = (e: ReactPointerEvent, direction: 'right' | 'bottom' | 'corner') => {
    e.stopPropagation();
    e.preventDefault();

    if (!onResize || !resizable || e.button !== 0) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = puzzle.width;
    const startWidthPx = wrapperRef.current?.getBoundingClientRect().width ?? startWidth * 72;
    const startHeight = puzzle.height;

    let lastWidth = startWidth;
    let lastHeight = startHeight;

    const handleMove = (moveEvent: PointerEvent) => {
      // Calculate how many grid cells we've moved
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      // Convert pixel delta to grid cells, measured from the puzzle's on-screen
      // width since the sheet may be zoomed to fit the window
      const cellSizePx = startWidthPx / startWidth;
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
      if (newWidth !== lastWidth || newHeight !== lastHeight) {
        lastWidth = newWidth;
        lastHeight = newHeight;
        onResize(puzzle.id, newWidth, newHeight);
      }
    };

    trackPointerDrag(e, { onMove: handleMove, onEnd: () => {} });
  };

  const renderPuzzle = () => {
    const definition = getPuzzleDefinition(puzzle.type);

    if (!definition) {
      console.error(`Unknown puzzle type: ${puzzle.type}`);
      return null;
    }

    // Cast needed: registry aggregates heterogeneous puzzle types as PuzzleDefinition<unknown>
    // Type safety is preserved within individual puzzle definitions
    const Component = definition.component as React.ComponentType<{
      gridWidth: number;
      gridHeight: number;
      seed: number;
      config: unknown;
    }>;

    // Use puzzle's stored config, fallback to definition default
    const config = puzzle.config ?? definition.defaultConfig;

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
      ref={wrapperRef}
      className={`${styles.wrapper} ${selected ? styles.selected : ''} ${moving ? styles.moving : ''}`}
      onPointerDown={handlePointerDown}
      onClick={onSelect && ((e) => {
        // Keep the page behind from clearing the selection again
        e.stopPropagation();
        onSelect(puzzle.id);
      })}
      style={{
        left: `${puzzle.x * CELL_SIZE_MM}mm`,
        top: `${puzzle.y * CELL_SIZE_MM}mm`,
        width: `${puzzle.width * CELL_SIZE_MM}mm`,
        height: `${puzzle.height * CELL_SIZE_MM}mm`,
      }}
    >
      <div
        className={styles.dragHandle}
        onPointerDown={handleHandlePointerDown}
        title="Drag to reposition"
      >
        ⋮⋮
      </div>
      <div className={styles.buttonGroup}>
        {puzzleDef && (
          <HelpButton
            className={styles.helpButton}
            subject={{
              definition: puzzleDef,
              label: puzzleDef.label,
              icon: puzzleDef.icon,
              category: puzzleDef.category,
              ages: puzzleDef.ages,
              config: puzzle.config ?? puzzleDef.defaultConfig,
            }}
          />
        )}
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
            // Cast needed: registry aggregates heterogeneous puzzle types
            const ConfigComponent = puzzleDef.configComponent as React.ComponentType<{
              value: unknown;
              onChange: (config: unknown) => void;
            }>;
            const currentConfig = puzzle.config ?? puzzleDef.defaultConfig;
            return (
              <ConfigComponent
                value={currentConfig}
                onChange={(newConfig) => {
                  onConfigChange(puzzle.id, newConfig);
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
              onPointerDown={(e) => handleResizeStart(e, 'right')}
              title="Resize width"
            />
          )}
          {resizable.height && (
            <div
              className={styles.resizeHandleBottom}
              onPointerDown={(e) => handleResizeStart(e, 'bottom')}
              title="Resize height"
            />
          )}
          {resizable.width && resizable.height && (
            <div
              className={styles.resizeHandleCorner}
              onPointerDown={(e) => handleResizeStart(e, 'corner')}
              title="Resize both"
            />
          )}
        </>
      )}
    </div>
  );
}
