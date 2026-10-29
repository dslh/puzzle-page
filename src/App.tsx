import { useEffect, useRef, useState } from 'react';
import Sidebar from './components/Sidebar';
import GridLayout from './components/GridLayout';
import PuzzleSheet from './components/PuzzleSheet';
import PageHistory from './components/PageHistory';
import { getSidebarEntry, type SidebarEntry } from './components/puzzles';
import { DragConfigProvider } from './contexts/DragConfigContext';
import type { PlacedPuzzle } from './types/puzzle';
import { activeChild, activeSlot, copyPage, newSeed, recordPrint, updateSlot, type SavedPage } from './profiles/store';
import { useStore } from './profiles/useStore';
import { collides, findFreeSpot, newPlacedPuzzle } from './utils/placement';
import { useCompactLayout, useDockedPanel } from './utils/useCompactLayout';
import { SHEET_EXIT_MS } from './utils/motion';
import { fileAway } from './utils/fileAway';
import styles from './App.module.css';

const puzzleLabel = (puzzle: PlacedPuzzle) =>
  getSidebarEntry(puzzle.entry, puzzle.type)?.label ?? 'the puzzle';

function App() {
  const { store, change, undo, undoLast, dismissUndo, canSave } = useStore();
  const child = activeChild(store);
  const puzzles = activeSlot(store).page;
  const compact = useCompactLayout();
  const docked = useDockedPanel();

  // The page being made, or (for a child) the pages printed for them before
  const [view, setView] = useState<'page' | 'pages'>('page');
  const showingPages = view === 'pages' && child !== undefined;

  // The puzzle whose controls are open - docked beside the sheet in wide
  // windows, else in the bottom sheet - and whether it was chosen from the
  // keyboard, so its controls take the focus. And (compact layout) whether
  // the sidebar drawer is out.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedByKey, setSelectedByKey] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const selectedPuzzle = !showingPages ? puzzles.find(p => p.id === selectedId) : undefined;

  const select = (id: string | null, fromKeyboard = false) => {
    setSelectedId(id);
    setSelectedByKey(fromKeyboard);
  };

  // Done or Escape in the controls: focus goes back to the puzzle, if it was
  // in them, so the keyboard carries on from where it was
  const closeControls = () => {
    const id = selectedId;
    select(null);
    if (document.activeElement?.closest('[data-puzzle-controls]')) {
      document.querySelector<HTMLElement>(`[data-puzzle-id="${id}"]`)?.focus();
    }
  };

  // The bottom sheet is drawn a moment longer once nothing is selected, while
  // it slides back down
  const [closingPuzzle, setClosingPuzzle] = useState<PlacedPuzzle | null>(null);
  const [lastSelected, setLastSelected] = useState(selectedPuzzle);
  if (selectedPuzzle !== lastSelected) {
    setLastSelected(selectedPuzzle);
    setClosingPuzzle(selectedPuzzle || docked ? null : lastSelected ?? null);
  }
  useEffect(() => {
    if (!closingPuzzle) return;
    const timer = setTimeout(() => setClosingPuzzle(null), SHEET_EXIT_MS + 50);
    return () => clearTimeout(timer);
  }, [closingPuzzle]);
  const sheetPuzzle = selectedPuzzle ?? closingPuzzle;

  // A short message in the toolbar, e.g. when a tapped puzzle has no room
  const [notice, setNotice] = useState<string | null>(null);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  // Print once a page put back from the history is on the desk
  const [printPending, setPrintPending] = useState(false);
  useEffect(() => {
    if (!printPending) return;
    setPrintPending(false);
    window.print();
  }, [printPending]);

  // Every change to the page goes through here, so it is saved with the rest
  const setPage = (page: (puzzles: PlacedPuzzle[]) => PlacedPuzzle[], undoMessage?: string) => {
    change(s => updateSlot(s, slot => ({ page: page(slot.page) })), undoMessage);
  };

  // Dropped from the sidebar. Selected, so its controls open and it's seen
  // where it landed.
  const handleAddPuzzle = (puzzle: PlacedPuzzle) => {
    setPage(page => [...page, puzzle]);
    select(puzzle.id);
  };

  const handleAddFromSidebar = (entry: SidebarEntry, config: unknown): boolean => {
    const { defaultWidth, defaultHeight } = entry;
    const { type, resizable } = entry.definition;
    const spot = findFreeSpot(puzzles, defaultWidth, defaultHeight, resizable);
    if (!spot) {
      setNotice(`No room for ${entry.label} - remove or shrink a puzzle first`);
      setDrawerOpen(false);
      return false;
    }
    const puzzle = newPlacedPuzzle(type, spot.x, spot.y, spot.width, spot.height, config, entry.key);
    setPage(page => [...page, puzzle]);
    const shrunk = spot.width !== defaultWidth || spot.height !== defaultHeight;
    setNotice(shrunk ? `Added ${entry.label} at ${spot.width}×${spot.height} to fit` : null);
    setDrawerOpen(false);
    setView('page');
    select(puzzle.id);
    return true;
  };

  const handleRemovePuzzle = (id: string) => {
    const puzzle = puzzles.find(p => p.id === id);
    setPage(page => page.filter(p => p.id !== id), puzzle && `Removed ${puzzleLabel(puzzle)}`);
  };

  const handleRerollPuzzle = (id: string) => {
    const puzzle = puzzles.find(p => p.id === id);
    setPage(
      page => page.map(p => p.id === id ? { ...p, seed: newSeed() } : p),
      puzzle && `New ${puzzleLabel(puzzle)}`,
    );
  };

  const handleUpdatePuzzle = (id: string, x: number, y: number) => {
    setPage(page => page.map(p => p.id === id ? { ...p, x, y } : p));
  };

  const handleResizePuzzle = (id: string, width: number, height: number) => {
    // Only update if it stays on the page and clear of other puzzles
    setPage(page => {
      const puzzle = page.find(p => p.id === id);
      if (!puzzle || collides(page, puzzle.x, puzzle.y, width, height, id)) return page;
      return page.map(p => p.id === id ? { ...p, width, height } : p);
    });
  };

  // A setting changed on the page is also what that sidebar entry starts
  // from next time, for this child
  const handleConfigChange = (id: string, config: unknown) => {
    const puzzle = puzzles.find(p => p.id === id);
    change(s => updateSlot(s, slot => ({
      page: slot.page.map(p => p.id === id ? { ...p, config } : p),
      ...(puzzle?.entry && { settings: { ...slot.settings, [puzzle.entry]: config } }),
    })));
  };

  // The Printed button, where a printed page is seen to go
  const printedRef = useRef<HTMLButtonElement>(null);

  const handlePrint = () => {
    change(recordPrint);
    window.print();
    // The print dialog has closed by now; show the page going into the history
    if (child) {
      fileAway(document.querySelector<HTMLElement>('[data-sheet]'), printedRef.current);
      setNotice(`${child.name}’s page is kept in Printed`);
    }
  };

  const handleClear = () => {
    setPage(() => [], 'Cleared the page');
  };

  // Puts a page from the history on the desk, in place of the one there
  const choosePage = (page: PlacedPuzzle[], print: boolean) => {
    change(
      s => {
        const next = updateSlot(s, () => ({ page }));
        return print ? recordPrint(next) : next;
      },
      puzzles.length > 0 ? 'Replaced your page' : undefined,
    );
    select(null);
    setView('page');
    if (print) setPrintPending(true);
  };

  const handleUsePage = (page: SavedPage, reroll: boolean) => {
    choosePage(copyPage(page, reroll), false);
  };

  const handlePrintAgain = (page: SavedPage) => {
    choosePage(page.puzzles, true);
  };

  const lastPage = child?.history[0];
  const pageName = child ? `${child.name}’s page` : 'The page';
  const status = notice ?? (puzzles.length === 0
    ? `${pageName} is empty`
    : `${pageName}: ${puzzles.length} puzzle${puzzles.length !== 1 ? 's' : ''}`);

  const emptyPrompt = (
    <div className={styles.emptyPrompt}>
      <p>
        {compact
          ? 'Tap + Puzzles to choose puzzles for this page.'
          : 'Choose puzzles from the list, then print.'}
      </p>
      {lastPage && (
        <button type="button" className={styles.emptyAction} onClick={() => handleUsePage(lastPage, true)}>
          Make one like the last page
        </button>
      )}
    </div>
  );

  return (
    <DragConfigProvider>
      <div className={styles.app}>
        <Sidebar
          store={store}
          onChange={(next, undoMessage) => {
            change(next, undoMessage);
            select(null);
          }}
          canSave={canSave}
          onAdd={handleAddFromSidebar}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />
        {drawerOpen && (
          <div className={styles.backdrop} onClick={() => setDrawerOpen(false)} aria-hidden="true" />
        )}
        <main className={`${styles.desk} ${selectedPuzzle && !docked ? styles.withSheet : ''}`}>
          <div className={styles.toolbar}>
            <button
              type="button"
              className={styles.menuButton}
              onClick={() => setDrawerOpen(true)}
              aria-expanded={drawerOpen}
            >
              + Puzzles
            </button>
            {child && (
              <div className={styles.viewSwitch} role="group" aria-label={`${child.name}’s pages`}>
                <button
                  type="button"
                  className={!showingPages ? styles.selected : ''}
                  aria-pressed={!showingPages}
                  onClick={() => setView('page')}
                >
                  This page
                </button>
                <button
                  ref={printedRef}
                  type="button"
                  className={showingPages ? styles.selected : ''}
                  aria-pressed={showingPages}
                  onClick={() => { setView('pages'); select(null); }}
                >
                  Printed <span className={styles.viewCount}>{child.history.length}</span>
                </button>
              </div>
            )}
            <span className={styles.puzzleCount} role="status">
              {showingPages ? `Pages printed for ${child.name}` : status}
            </span>
            {!showingPages && (
              <>
                <button
                  type="button"
                  className={styles.clearButton}
                  onClick={handleClear}
                  disabled={puzzles.length === 0}
                >
                  Clear page
                </button>
                <button
                  type="button"
                  className={styles.printButton}
                  onClick={handlePrint}
                  disabled={puzzles.length === 0}
                >
                  Print
                </button>
              </>
            )}
          </div>
          {showingPages && (
            <PageHistory
              store={store}
              child={child}
              onChange={change}
              onUse={handleUsePage}
              onPrintAgain={handlePrintAgain}
            />
          )}
          <div className={showingPages ? styles.offScreen : styles.pageArea}>
            <GridLayout
              puzzles={puzzles}
              onAddPuzzle={handleAddPuzzle}
              onRemovePuzzle={handleRemovePuzzle}
              onRerollPuzzle={handleRerollPuzzle}
              onUpdatePuzzle={handleUpdatePuzzle}
              onResizePuzzle={handleResizePuzzle}
              selectedId={selectedPuzzle?.id}
              onSelect={select}
              emptyPrompt={emptyPrompt}
            />
          </div>
        </main>
        {docked && !showingPages && (
          <aside className={styles.dock} aria-label="Selected puzzle">
            {selectedPuzzle ? (
              <PuzzleSheet
                key={selectedPuzzle.id}
                puzzle={selectedPuzzle}
                docked
                takeFocus={selectedByKey}
                onReroll={handleRerollPuzzle}
                onRemove={handleRemovePuzzle}
                onConfigChange={handleConfigChange}
                onClose={closeControls}
              />
            ) : (
              <p className={styles.dockHint}>
                {puzzles.length > 0
                  ? 'Click a puzzle on the page to change its settings, get a new one or remove it.'
                  : 'A puzzle’s settings show here once it’s on the page.'}
              </p>
            )}
          </aside>
        )}
        {!docked && sheetPuzzle && (
          <PuzzleSheet
            puzzle={sheetPuzzle}
            closing={!selectedPuzzle}
            takeFocus={selectedByKey}
            onReroll={handleRerollPuzzle}
            onRemove={handleRemovePuzzle}
            onConfigChange={handleConfigChange}
            onClose={closeControls}
          />
        )}
        <div className={`${styles.undoBar} ${docked && !showingPages ? styles.besideDock : ''}`} role="status">
          {undo && (
            <div key={undo} className={styles.undoToast}>
              <span>{undo}.</span>
              <button type="button" className={styles.undoButton} onClick={undoLast}>
                Undo
              </button>
              <button type="button" className={styles.dismissButton} onClick={dismissUndo} aria-label="Dismiss">
                ×
              </button>
            </div>
          )}
        </div>
      </div>
    </DragConfigProvider>
  );
}

export default App;
