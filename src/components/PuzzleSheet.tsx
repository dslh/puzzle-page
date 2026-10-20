import type { PlacedPuzzle } from '../types/puzzle';
import { getPuzzleDefinition } from './puzzles';
import HelpButton from './help/HelpButton';
import styles from './PuzzleSheet.module.css';

interface PuzzleSheetProps {
  puzzle: PlacedPuzzle;
  onReroll: (id: string) => void;
  onRemove: (id: string) => void;
  onConfigChange: (id: string, config: unknown) => void;
  onClose: () => void;
}

/**
 * The selected puzzle's controls, along the bottom of the screen. Used on
 * touch screens and narrow windows, where the on-puzzle hover controls are
 * either unreachable or shrunk with the sheet.
 */
export default function PuzzleSheet({ puzzle, onReroll, onRemove, onConfigChange, onClose }: PuzzleSheetProps) {
  const definition = getPuzzleDefinition(puzzle.type);
  if (!definition) return null;

  const config = puzzle.config ?? definition.defaultConfig;
  // Cast needed: registry aggregates heterogeneous puzzle types
  const ConfigComponent = definition.configComponent as React.ComponentType<{
    value: unknown;
    onChange: (config: unknown) => void;
  }> | undefined;

  return (
    <section className={styles.sheet} aria-label={`${definition.label} settings`}>
      <div className={styles.head}>
        <span className={styles.icon} aria-hidden="true">{definition.icon}</span>
        <h2 className={styles.title}>{definition.label}</h2>
        <button type="button" className={styles.done} onClick={onClose}>
          Done
        </button>
      </div>
      <div className={styles.actions}>
        <HelpButton
          className={styles.roundButton}
          subject={{
            definition,
            label: definition.label,
            icon: definition.icon,
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
      <p className={styles.hint}>
        {definition.resizable
          ? 'Drag the puzzle to move it. Drag the dark tabs on its edges to change its size.'
          : 'Drag the puzzle to move it.'}
      </p>
      {ConfigComponent && config !== undefined && (
        <div className={styles.config}>
          <ConfigComponent value={config} onChange={newConfig => onConfigChange(puzzle.id, newConfig)} />
        </div>
      )}
    </section>
  );
}
