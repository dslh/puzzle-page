import { CELL_SIZE_MM } from '../types/puzzle';
import type { PlacedPuzzle } from '../types/puzzle';
import Maze from './puzzles/Maze';
import Sudoku from './puzzles/Sudoku';
import styles from './PuzzleWrapper.module.css';

interface PuzzleWrapperProps {
  puzzle: PlacedPuzzle;
  onRemove?: (id: string) => void;
  onReroll?: (id: string) => void;
}

export default function PuzzleWrapper({ puzzle, onRemove, onReroll }: PuzzleWrapperProps) {
  const renderPuzzle = () => {
    switch (puzzle.type) {
      case 'maze':
        return <Maze width={6} height={6} seed={puzzle.seed} />;
      case 'sudoku':
        return <Sudoku seed={puzzle.seed} />;
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
    </div>
  );
}
