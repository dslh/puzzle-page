import { useEffect, useRef } from 'react';
import type { PlacedPuzzle } from '../types/puzzle';
import { getPuzzleDefinition, getSidebarEntry } from './puzzles';
import HelpButton from './help/HelpButton';
import styles from './PuzzleSheet.module.css';

interface PuzzleSheetProps {
  puzzle: PlacedPuzzle;
  onReroll: (id: string) => void;
  onRemove: (id: string) => void;
  onConfigChange: (id: string, config: unknown) => void;
  onClose: () => void;
  /** Nothing is selected any more: the sheet slides away, and can't be used. */
  closing?: boolean;
  /** In the panel docked beside the sheet, rather than along the bottom. */
  docked?: boolean;
  /** Chosen from the keyboard: focus moves into the controls. */
  takeFocus?: boolean;
}

/**
 * The selected puzzle's controls: in a panel docked beside the sheet in wide
 * windows, else along the bottom of the screen.
 */
export default function PuzzleSheet({ puzzle, onReroll, onRemove, onConfigChange, onClose, closing, docked, takeFocus }: PuzzleSheetProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (takeFocus) titleRef.current?.focus();
  }, [takeFocus, puzzle.id]);

  const definition = getPuzzleDefinition(puzzle.type);
  if (!definition) return null;

  const config = puzzle.config ?? definition.defaultConfig;
  // Named as it was in the sidebar, e.g. Word Matching rather than Matching
  const entry = getSidebarEntry(puzzle.entry, puzzle.type);
  const label = entry?.label ?? definition.label;
  const icon = entry?.icon ?? definition.icon;
  // Cast needed: registry aggregates heterogeneous puzzle types
  const ConfigComponent = definition.configComponent as React.ComponentType<{
    value: unknown;
    onChange: (config: unknown) => void;
  }> | undefined;

  return (
    <section
      className={`${docked ? styles.docked : styles.sheet} ${closing ? styles.closing : ''}`}
      aria-label={`${label} settings`}
      inert={closing}
      data-puzzle-controls
      onKeyDown={e => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <div className={styles.head}>
        <span className={styles.icon} aria-hidden="true">{icon}</span>
        <h2 ref={titleRef} className={styles.title} tabIndex={-1}>{label}</h2>
        <button type="button" className={styles.done} onClick={onClose}>
          Done
        </button>
      </div>
      <div className={styles.actions}>
        <HelpButton
          className={styles.roundButton}
          subject={entry ? { ...entry, config } : {
            definition,
            label,
            icon,
            category: definition.category,
            ages: definition.ages,
            config,
          }}
        />
        <button type="button" className={styles.action} onClick={() => onReroll(puzzle.id)}>
          🎲 New puzzle
        </button>
        <button type="button" className={`${styles.action} ${styles.remove}`} onClick={() => onRemove(puzzle.id)}>
          Remove
        </button>
      </div>
      <p className={`${styles.hint} ${styles.touchHint}`}>
        {definition.resizable
          ? 'Drag the puzzle to move it. Drag the dark tabs on its edges to change its size.'
          : 'Drag the puzzle to move it.'}
      </p>
      <p className={`${styles.hint} ${styles.mouseHint}`}>
        {definition.resizable
          ? 'Drag the puzzle to move it, or the dark tabs on its edges to change its size. Arrow keys move it too, and Shift with an arrow changes its size.'
          : 'Drag the puzzle to move it. Arrow keys move it too.'}
      </p>
      {ConfigComponent && config !== undefined && (
        <div className={styles.config}>
          <ConfigComponent value={config} onChange={newConfig => onConfigChange(puzzle.id, newConfig)} />
        </div>
      )}
    </section>
  );
}
