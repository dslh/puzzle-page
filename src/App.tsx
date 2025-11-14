import { useState } from 'react';
import Maze from './components/puzzles/Maze';
import Sudoku from './components/puzzles/Sudoku';
import styles from './App.module.css';

function App() {
  const [puzzleSeed, setPuzzleSeed] = useState(Date.now());

  const handleGenerateNew = () => {
    setPuzzleSeed(Date.now());
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={styles.app}>
      <div className={styles.controls}>
        <button onClick={handleGenerateNew}>Generate New Puzzles</button>
        <button onClick={handlePrint}>Print Page</button>
      </div>

      <div className={styles.page}>
        <div className={styles.puzzleContainer}>
          <div className={styles.puzzleRow}>
            <Maze seed={puzzleSeed} width={6} height={6} />
            <Maze seed={puzzleSeed + 1} width={6} height={6} />
          </div>
          <div className={styles.puzzleRow}>
            <Sudoku seed={puzzleSeed + 2} />
            <Sudoku seed={puzzleSeed + 3} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
