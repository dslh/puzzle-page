import type { DragEvent } from 'react';
import { PUZZLE_DEFINITIONS } from '../types/puzzle';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const handleDragStart = (e: DragEvent<HTMLDivElement>, type: string, width: number, height: number) => {
    // Use custom type to pass puzzle data
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData(`puzzle/${type}/${width}/${height}`, '');
  };

  return (
    <aside className={styles.sidebar}>
      <h2 className={styles.title}>Puzzles</h2>
      <div className={styles.puzzleList}>
        {PUZZLE_DEFINITIONS.map((puzzle) => (
          <div
            key={puzzle.type}
            className={styles.puzzleItem}
            draggable
            onDragStart={(e) => handleDragStart(e, puzzle.type, puzzle.width, puzzle.height)}
          >
            <div className={styles.icon}>
              {puzzle.type === 'maze' ? '🧩' : puzzle.type === 'whichdoesntbelong' ? '🤔' : '🔢'}
            </div>
            <div className={styles.label}>{puzzle.label}</div>
            <div className={styles.hint}>Drag to grid →</div>
          </div>
        ))}
      </div>
      <div className={styles.instructions}>
        <p>Drag puzzles onto the grid to create your custom puzzle page.</p>
        <p>Green highlight = valid placement</p>
        <p>Red highlight = invalid (overlap or out of bounds)</p>
      </div>
    </aside>
  );
}
