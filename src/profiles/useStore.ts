import { useEffect, useState } from 'react';
import { loadStore, saveStore, type Store } from './store';

export type StoreUpdate = Store | ((store: Store) => Store);

/** Changes the store; with `undoMessage`, it can be undone for a few seconds. */
export type StoreChange = (next: StoreUpdate, undoMessage?: string) => void;

interface Undo {
  message: string;
  previous: Store;
}

const UNDO_MS = 8000;

/**
 * The editor's state, saved to this browser on every change. Undo keeps the
 * whole store from before the last undoable change, so anything - a removed
 * puzzle, a cleared page, a deleted child - comes back the same way.
 */
export function useStore() {
  const [store, setStore] = useState<Store>(loadStore);
  const [undo, setUndo] = useState<Undo | null>(null);
  const [canSave, setCanSave] = useState(true);

  useEffect(() => {
    if (!saveStore(store)) setCanSave(false);
  }, [store]);

  useEffect(() => {
    if (!undo) return;
    const timer = setTimeout(() => setUndo(null), UNDO_MS);
    return () => clearTimeout(timer);
  }, [undo]);

  const change: StoreChange = (next, undoMessage) => {
    setUndo(undoMessage ? { message: undoMessage, previous: store } : null);
    setStore(next);
  };

  const undoLast = () => {
    if (!undo) return;
    setStore(undo.previous);
    setUndo(null);
  };

  return { store, change, undo: undo?.message ?? null, undoLast, canSave };
}
