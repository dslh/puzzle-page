import { useState } from 'react';
import Sidebar from './components/Sidebar';
import GridLayout from './components/GridLayout';
import { DragConfigProvider } from './contexts/DragConfigContext';
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
    if (window.confirm('Clear all puzzles from the grid?')) {
      setPuzzles([]);
    }
  };

  return (
    <DragConfigProvider>
      <div className={styles.app}>
        <div className={styles.controls}>
          <button onClick={handlePrint}>Print Page</button>
          <button onClick={handleClear} disabled={puzzles.length === 0}>
            Clear Grid
          </button>
          <span className={styles.puzzleCount}>
            {puzzles.length} puzzle{puzzles.length !== 1 ? 's' : ''} on page
          </span>
        </div>

        <div className={styles.workspace}>
          <Sidebar />
          <GridLayout
            puzzles={puzzles}
            onAddPuzzle={handleAddPuzzle}
            onRemovePuzzle={handleRemovePuzzle}
            onRerollPuzzle={handleRerollPuzzle}
            onUpdatePuzzle={handleUpdatePuzzle}
            onResizePuzzle={handleResizePuzzle}
            onConfigChange={handleConfigChange}
          />
        </div>
      </div>
    </DragConfigProvider>
  );
}

export default App;
