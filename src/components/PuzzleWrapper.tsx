import { useEffect, useRef } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from 'react';
import { CELL_SIZE_MM } from '../types/puzzle';
import type { PlacedPuzzle } from '../types/puzzle';
import { getPuzzleDefinition, getSidebarEntry } from './puzzles';
import HelpButton from './help/HelpButton';
import { trackPointerDrag } from '../utils/pointerDrag';
import { EASE_IN, EASE_OUT, EXIT_MS, reducedMotion } from '../utils/motion';
import styles from './PuzzleWrapper.module.css';

// Arrow keys as a step in cells: [across, down]
const ARROW_STEPS: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

interface PuzzleWrapperProps {
  puzzle: PlacedPuzzle;
  onRemove?: (id: string) => void;
  onReroll?: (id: string) => void;
  onResize?: (id: string, width: number, height: number) => void;
  /** Starts moving this puzzle; GridLayout follows the pointer from here. */
  onMoveStart?: (puzzle: PlacedPuzzle, e: ReactPointerEvent) => void;
  /** An arrow key on the focused puzzle: moves it a cell, or with Shift resizes it. */
  onKeyStep?: (puzzle: PlacedPuzzle, dx: number, dy: number, resize: boolean) => void;
  /** Being moved: drawn faintly where it was until it lands. */
  moving?: boolean;
  selected?: boolean;
  /** `fromKeyboard`: chosen with Enter, so its controls take the focus. */
  onSelect?: (id: string | null, fromKeyboard?: boolean) => void;
  /** Added after the page first drew: laid onto the sheet rather than just appearing. */
  animateIn?: boolean;
  /** Just removed: GridLayout draws it a moment longer while it fades out. */
  leaving?: boolean;
}

export default function PuzzleWrapper({ puzzle, onRemove, onReroll, onResize, onMoveStart, onKeyStep, moving, selected, onSelect, animateIn, leaving }: PuzzleWrapperProps) {
  const puzzleDef = getPuzzleDefinition(puzzle.type);
  const resizable = puzzleDef?.resizable;
  const entry = getSidebarEntry(puzzle.entry, puzzle.type);
  const label = entry?.label ?? puzzleDef?.label ?? 'Puzzle';

  // Bring a newly selected puzzle into view, e.g. one just added from the drawer
  const wrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (selected) wrapperRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selected]);

  useEffect(() => {
    if (!animateIn) return;
    wrapperRef.current?.animate(
      reducedMotion()
        ? [{ opacity: 0 }, { opacity: 1 }]
        : [{ opacity: 0, transform: 'scale(0.96)' }, { opacity: 1, transform: 'none' }],
      { duration: 260, easing: EASE_OUT },
    );
    // Once, when the puzzle arrives
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The entrance played backwards, quicker, and held at the end until
  // GridLayout lets the puzzle go
  useEffect(() => {
    if (!leaving) return;
    wrapperRef.current?.animate(
      reducedMotion()
        ? [{ opacity: 1 }, { opacity: 0 }]
        : [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(0.96)' }],
      { duration: EXIT_MS, easing: EASE_IN, fill: 'forwards' },
    );
  }, [leaving]);

  // A new seed is drawn in over the old puzzle, left to right, behind a
  // pencil line - the reroll is the page's signature move, so it gets the
  // one authored sweep. With reduced motion it simply fades in.
  const contentRef = useRef<HTMLDivElement>(null);
  const lastSeed = useRef(puzzle.seed);
  useEffect(() => {
    if (lastSeed.current === puzzle.seed) return;
    lastSeed.current = puzzle.seed;
    const content = contentRef.current;
    if (!content) return;
    if (reducedMotion()) {
      content.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200 });
      return;
    }
    // A gentler curve than EASE_OUT, so the sweep is seen crossing
    const timing = { duration: 520, easing: 'cubic-bezier(0.33, 1, 0.68, 1)' };
    content.animate([{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], timing);
    wrapperRef.current?.animate(
      [
        { transform: 'translateX(-100%)', opacity: 1 },
        { transform: 'translateX(-15%)', opacity: 1, offset: 0.85 },
        { transform: 'none', opacity: 0 },
      ],
      { ...timing, pseudoElement: '::after' },
    );
  }, [puzzle.seed]);

  const handleReroll = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!reducedMotion()) {
      e.currentTarget.animate([{ rotate: '0turn' }, { rotate: '1turn' }], { duration: 420, easing: EASE_OUT });
    }
    onReroll?.(puzzle.id);
  };

  // With a mouse, a puzzle moves by its drag handle
  const handleHandlePointerDown = (e: ReactPointerEvent) => {
    if (e.button !== 0 || !onMoveStart) return;
    e.stopPropagation();
    e.preventDefault();
    onMoveStart(puzzle, e);
  };

  // The selected puzzle also moves by dragging the puzzle itself. Only the
  // selected one, so on a touch screen a swipe across the others still
  // scrolls the page. Events from the help dialog, portalled out of here,
  // still bubble through React, so they are let go.
  const handlePointerDown = (e: ReactPointerEvent) => {
    if (e.button !== 0 || !selected || !onMoveStart) return;
    if (!e.currentTarget.contains(e.target as Node)) return;
    onMoveStart(puzzle, e);
  };

  // The puzzle is one stop in the tab order. Enter opens its controls, the
  // arrows move it, and Shift with an arrow changes its size.
  const handleKeyDown = (e: ReactKeyboardEvent) => {
    if (e.target !== e.currentTarget) return;
    const step = ARROW_STEPS[e.key];
    if (step && onKeyStep) {
      e.preventDefault();
      onKeyStep(puzzle, step[0], step[1], e.shiftKey);
    } else if ((e.key === 'Enter' || e.key === ' ') && onSelect) {
      e.preventDefault();
      onSelect(puzzle.id, true);
    } else if (e.key === 'Escape' && selected && onSelect) {
      onSelect(null);
    }
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
      className={`${styles.wrapper} ${selected ? styles.selected : ''} ${moving ? styles.moving : ''} ${leaving ? styles.leaving : ''}`}
      data-puzzle-id={leaving ? undefined : puzzle.id}
      tabIndex={leaving ? undefined : 0}
      role="group"
      aria-roledescription="puzzle"
      aria-label={`${label}, ${puzzle.width} by ${puzzle.height}, row ${puzzle.y + 1}, column ${puzzle.x + 1}`}
      onPointerDown={handlePointerDown}
      onKeyDown={leaving ? undefined : handleKeyDown}
      onClick={onSelect && ((e) => {
        // Keep the page behind from clearing the selection again
        e.stopPropagation();
        if (e.currentTarget.contains(e.target as Node)) onSelect(puzzle.id);
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
        title="Drag to move"
        aria-hidden="true"
      >
        ⋮⋮
      </div>
      <div className={styles.buttonGroup}>
        {puzzleDef && (
          <HelpButton
            className={styles.helpButton}
            tabIndex={-1}
            subject={{
              definition: puzzleDef,
              label,
              icon: entry?.icon ?? puzzleDef.icon,
              category: entry?.category ?? puzzleDef.category,
              ages: entry?.ages ?? puzzleDef.ages,
              config: puzzle.config ?? puzzleDef.defaultConfig,
            }}
          />
        )}
        {onReroll && (
          <button
            type="button"
            className={styles.rerollButton}
            onClick={handleReroll}
            tabIndex={-1}
            title={`New ${label}`}
            aria-label={`New ${label}`}
          >
            🎲
          </button>
        )}
        {onRemove && (
          <button
            type="button"
            className={styles.deleteButton}
            onClick={() => onRemove(puzzle.id)}
            tabIndex={-1}
            title={`Remove ${label}`}
            aria-label={`Remove ${label}`}
          >
            ×
          </button>
        )}
      </div>

      <div ref={contentRef} className={styles.content}>{renderPuzzle()}</div>

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
