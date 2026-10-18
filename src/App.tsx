import { useState } from 'react';
import Sidebar from './components/Sidebar';
import GridLayout from './components/GridLayout';
import { DragConfigProvider } from './contexts/DragConfigContext';
import { GRID_COLS, GRID_ROWS } from './types/puzzle';
import type { PlacedPuzzle } from './types/puzzle';
import styles from './App.module.css';

function App() {
  const [puzzles, setPuzzles] = useState<PlacedPuzzle[]>([]);

  const handleAddPuzzle = (puzzle: PlacedPuzzle) => {
    setPuzzles([...puzzles, puzzle]);
  };

  const handleRemovePuzzle = (id: string) => {
    setPuzzles(puzzles.filter(p => p.id !== id));
  };

  const handleRerollPuzzle = (id: string) => {
    setPuzzles(puzzles.map(p =>
      p.id === id
        ? { ...p, seed: Date.now() + Math.floor(Math.random() * 1000) }
        : p
    ));
  };

  const handleUpdatePuzzle = (id: string, x: number, y: number) => {
    setPuzzles(puzzles.map(p =>
      p.id === id
        ? { ...p, x, y }
        : p
    ));
  };

  const handleResizePuzzle = (id: string, width: number, height: number) => {
    // Find the puzzle being resized
    const puzzle = puzzles.find(p => p.id === id);
    if (!puzzle) return;

    // Keep the puzzle on the page
    if (puzzle.x + width > GRID_COLS || puzzle.y + height > GRID_ROWS) return;

    // Check for collisions with other puzzles
    const hasCollision = puzzles.some(other => {
      if (other.id === id) return false; // Don't check against itself

      const xOverlap = puzzle.x < other.x + other.width && puzzle.x + width > other.x;
      const yOverlap = puzzle.y < other.y + other.height && puzzle.y + height > other.y;

      return xOverlap && yOverlap;
    });

    // Only update if no collision
    if (!hasCollision) {
      setPuzzles(puzzles.map(p =>
        p.id === id
          ? { ...p, width, height }
          : p
      ));
    }
  };

  const handleConfigChange = (id: string, config: unknown) => {
    setPuzzles(puzzles.map(p =>
      p.id === id
        ? { ...p, config }
        : p
    ));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleClear = () => {
    if (window.confirm('Remove every puzzle from the page?')) {
      setPuzzles([]);
    }
  };

  return (
    <DragConfigProvider>
      <div className={styles.app}>
        <Sidebar />
        <main className={styles.desk}>
          <div className={styles.toolbar}>
            <span className={styles.puzzleCount}>
              {puzzles.length === 0
                ? 'Drag a puzzle onto the page'
                : `${puzzles.length} puzzle${puzzles.length !== 1 ? 's' : ''} on the page`}
            </span>
            <button
              type="button"
              className={styles.clearButton}
              onClick={handleClear}
              disabled={puzzles.length === 0}
            >
              Clear page
            </button>
            <button type="button" className={styles.printButton} onClick={handlePrint}>
              Print
            </button>
          </div>
          <GridLayout
            puzzles={puzzles}
            onAddPuzzle={handleAddPuzzle}
            onRemovePuzzle={handleRemovePuzzle}
            onRerollPuzzle={handleRerollPuzzle}
            onUpdatePuzzle={handleUpdatePuzzle}
            onResizePuzzle={handleResizePuzzle}
            onConfigChange={handleConfigChange}
          />
        </main>
      </div>
    </DragConfigProvider>
  );
}

export default App;
