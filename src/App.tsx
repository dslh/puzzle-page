import { useState } from 'react';
import Sidebar from './components/Sidebar';
import GridLayout from './components/GridLayout';
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

  const handlePrint = () => {
    window.print();
  };

  const handleClear = () => {
    if (window.confirm('Clear all puzzles from the grid?')) {
      setPuzzles([]);
    }
  };

  return (
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
        />
      </div>
    </div>
  );
}

export default App;
