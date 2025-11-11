import { useState } from 'react';
import Maze from './components/puzzles/Maze';
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
        <h1 className={styles.pageTitle}>Puzzle Page</h1>
        <div className={styles.puzzleContainer}>
          <Maze seed={puzzleSeed} width={6} height={6} />
        </div>
      </div>
    </div>
  );
}

export default App;
