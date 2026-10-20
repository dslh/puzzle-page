import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import GridLayout from './components/GridLayout';
import PuzzleSheet from './components/PuzzleSheet';
import type { SidebarEntry } from './components/puzzles';
import { DragConfigProvider } from './contexts/DragConfigContext';
import type { PlacedPuzzle } from './types/puzzle';
import { collides, findFreeSpot, newPlacedPuzzle } from './utils/placement';
import { useCompactLayout } from './utils/useCompactLayout';
import styles from './App.module.css';

function App() {
  const [puzzles, setPuzzles] = useState<PlacedPuzzle[]>([]);
  const compact = useCompactLayout();

  // Compact layout only: the puzzle whose controls are in the bottom sheet,
  // and whether the sidebar drawer is out.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const selectedPuzzle = compact ? puzzles.find(p => p.id === selectedId) : undefined;

  // A short message in the toolbar, e.g. when a tapped puzzle has no room
  const [notice, setNotice] = useState<string | null>(null);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  const handleAddPuzzle = (puzzle: PlacedPuzzle) => {
    setPuzzles([...puzzles, puzzle]);
  };

  const handleAddFromSidebar = (entry: SidebarEntry, config: unknown): boolean => {
    const { type, defaultWidth, defaultHeight } = entry.definition;
    const spot = findFreeSpot(puzzles, defaultWidth, defaultHeight);
    if (!spot) {
      setNotice(`No room for ${entry.label} - remove or shrink a puzzle first`);
      setDrawerOpen(false);
      return false;
    }
    const puzzle = newPlacedPuzzle(type, spot.x, spot.y, defaultWidth, defaultHeight, config);
    setPuzzles([...puzzles, puzzle]);
    setNotice(null);
    setDrawerOpen(false);
    if (compact) setSelectedId(puzzle.id);
    return true;
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

    // Only update if it stays on the page and clear of other puzzles
    if (!collides(puzzles, puzzle.x, puzzle.y, width, height, id)) {
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
        <Sidebar onAdd={handleAddFromSidebar} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
        {drawerOpen && (
          <div className={styles.backdrop} onClick={() => setDrawerOpen(false)} aria-hidden="true" />
        )}
        <main className={`${styles.desk} ${selectedPuzzle ? styles.withSheet : ''}`}>
          <div className={styles.toolbar}>
            <button
              type="button"
              className={styles.menuButton}
              onClick={() => setDrawerOpen(true)}
              aria-expanded={drawerOpen}
            >
              + Puzzles
            </button>
            <span className={styles.puzzleCount} role="status">
              {notice ?? (puzzles.length === 0
                ? (compact ? 'Add a puzzle to start' : 'Drag a puzzle onto the page')
                : `${puzzles.length} puzzle${puzzles.length !== 1 ? 's' : ''} on the page`)}
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
            selectedId={selectedPuzzle?.id}
            onSelect={compact ? setSelectedId : undefined}
          />
        </main>
        {selectedPuzzle && (
          <PuzzleSheet
            puzzle={selectedPuzzle}
            onReroll={handleRerollPuzzle}
            onRemove={handleRemovePuzzle}
            onConfigChange={handleConfigChange}
            onClose={() => setSelectedId(null)}
          />
        )}
      </div>
    </DragConfigProvider>
  );
}

export default App;
