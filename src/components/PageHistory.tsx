import { useState } from 'react';
import { getSidebarEntry } from './puzzles';
import PagePreview from './PagePreview';
import { RATINGS, updateChild, type Child, type Rating, type SavedPage, type Store } from '../profiles/store';
import type { StoreChange } from '../profiles/useStore';
import styles from './PageHistory.module.css';

interface PageHistoryProps {
  store: Store;
  child: Child;
  onChange: StoreChange;
  /** Puts a saved page back on the desk; `reroll` gives it new puzzles. */
  onUse: (page: SavedPage, reroll: boolean) => void;
  onPrintAgain: (page: SavedPage) => void;
}

// Each preview draws its puzzles for real, so a long history shows in steps
const PAGE_STEP = 12;
const PREVIEW_PX = 168;

function printedOn(printedAt: number): string {
  const date = new Date(printedAt);
  const days = Math.round(
    (new Date().setHours(0, 0, 0, 0) - new Date(printedAt).setHours(0, 0, 0, 0)) / 86_400_000,
  );
  const time = date.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit' });
  if (days === 0) return `Today, ${time}`;
  if (days === 1) return `Yesterday, ${time}`;
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    ...(date.getFullYear() !== new Date().getFullYear() && { year: 'numeric' }),
  });
}

/** The pages printed for a child, newest first, to print again, reuse or rate. */
export default function PageHistory({ store, child, onChange, onUse, onPrintAgain }: PageHistoryProps) {
  const [shown, setShown] = useState(PAGE_STEP);

  const setRating = (page: SavedPage, puzzleId: string, rating: Rating) => {
    onChange(updateChild(store, child.id, c => ({
      history: c.history.map(p => {
        if (p.id !== page.id) return p;
        const ratings = { ...p.ratings };
        // Choosing the same answer again takes it back
        if (ratings[puzzleId] === rating) delete ratings[puzzleId];
        else ratings[puzzleId] = rating;
        return { ...p, ratings };
      }),
    })));
  };

  const removePage = (page: SavedPage) => {
    onChange(updateChild(store, child.id, c => ({
      history: c.history.filter(p => p.id !== page.id),
    })), `Removed the page from ${child.name}’s pages`);
  };

  if (child.history.length === 0) {
    return (
      <div className={styles.empty}>
        <h2 className={styles.emptyTitle}>No pages yet</h2>
        <p>
          Pages you print for {child.name} are kept here, ready to print again.
          After they’ve done one, say how each puzzle went, and the puzzle list
          will remind you next time.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.history}>
      <ol className={styles.pages}>
        {child.history.slice(0, shown).map(page => (
          <li key={page.id} className={styles.page}>
            <div className={styles.preview}>
              <PagePreview puzzles={page.puzzles} width={PREVIEW_PX} />
            </div>
            <div className={styles.details}>
              <h2 className={styles.date}>{printedOn(page.printedAt)}</h2>
              <ul className={styles.puzzles}>
                {page.puzzles.map(puzzle => {
                  const entry = getSidebarEntry(puzzle.entry, puzzle.type);
                  const label = entry?.label ?? puzzle.type;
                  return (
                    <li key={puzzle.id} className={styles.puzzle}>
                      <span className={styles.puzzleName}>
                        <span aria-hidden="true">{entry?.icon}</span> {label}
                      </span>
                      <div className={styles.ratings} role="group" aria-label={`How ${label} went`}>
                        {RATINGS.map(rating => (
                          <button
                            key={rating.id}
                            type="button"
                            className={`${styles.rating} ${page.ratings[puzzle.id] === rating.id ? styles.selected : ''}`}
                            aria-pressed={page.ratings[puzzle.id] === rating.id}
                            onClick={() => setRating(page, puzzle.id, rating.id)}
                          >
                            {rating.label}
                          </button>
                        ))}
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className={styles.actions}>
                <button type="button" className={styles.primary} onClick={() => onPrintAgain(page)}>
                  Print again
                </button>
                <button type="button" className={styles.secondary} onClick={() => onUse(page, true)}>
                  Make one like this
                </button>
                <button type="button" className={styles.secondary} onClick={() => onUse(page, false)}>
                  Edit
                </button>
                <button type="button" className={styles.remove} onClick={() => removePage(page)}>
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ol>
      {child.history.length > shown && (
        <button type="button" className={styles.more} onClick={() => setShown(shown + PAGE_STEP)}>
          Show older pages
        </button>
      )}
    </div>
  );
}
