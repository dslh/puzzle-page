import { useState } from 'react';
import type { DragEvent } from 'react';
import { PUZZLE_DEFINITIONS } from './puzzles';
import type { SudokuConfig } from './puzzles/Sudoku';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const [sudokuSize, setSudokuSize] = useState<3 | 4>(3);

  const handleDragStart = (e: DragEvent<HTMLDivElement>, type: string, width: number, height: number) => {
    // Use custom type to pass puzzle data, including config for Sudoku
    e.dataTransfer.effectAllowed = 'copy';

    // Format: puzzle/{type}/{width}/{height}/{puzzleId}/{config}
    // For new puzzles, puzzleId slot is empty
    let dataString = `puzzle/${type}/${width}/${height}`;

    if (type === 'sudoku') {
      const config: SudokuConfig = { size: sudokuSize };
      dataString += `//${JSON.stringify(config)}`; // Empty puzzleId slot
    }

    e.dataTransfer.setData(dataString, '');
  };

  return (
    <aside className={styles.sidebar}>
      <h2 className={styles.title}>Puzzles</h2>
      <div className={styles.puzzleList}>
        {PUZZLE_DEFINITIONS.map((puzzle) => {
          const ConfigComponent = puzzle.configComponent;
          const isSudoku = puzzle.type === 'sudoku';

          return (
            <div
              key={puzzle.type}
              className={styles.puzzleItem}
              draggable
              onDragStart={(e) => handleDragStart(e, puzzle.type, puzzle.defaultWidth, puzzle.defaultHeight)}
            >
              <div className={styles.icon}>
                {puzzle.icon}
              </div>
              <div className={styles.label}>{puzzle.label}</div>
              <div className={styles.hint}>Drag to grid →</div>
              {isSudoku && ConfigComponent && (
                <div className={styles.configSection}>
                  <ConfigComponent
                    value={sudokuSize}
                    onChange={setSudokuSize}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className={styles.instructions}>
        <p>Drag puzzles onto the grid to create your custom puzzle page.</p>
        <p>Green highlight = valid placement</p>
        <p>Red highlight = invalid (overlap or out of bounds)</p>
      </div>
    </aside>
  );
}
