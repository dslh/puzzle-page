import { useEffect, useState } from 'react';
import { loadStore, saveStore, type Store } from './store';

export type StoreUpdate = Store | ((store: Store) => Store);

/** Changes the store; with `undoMessage`, it can be undone until the next change. */
export type StoreChange = (next: StoreUpdate, undoMessage?: string) => void;

interface Undo {
  message: string;
  previous: Store;
}

/**
 * The editor's state, saved to this browser on every change. Undo keeps the
 * whole store from before the last undoable change, so anything - a removed
 * puzzle, a cleared page, a deleted child - comes back the same way. It
 * lasts until the next change, or until it is dismissed: not on a timer, so
 * a parent who looked away still finds it.
 */
export function useStore() {
  const [store, setStore] = useState<Store>(loadStore);
  const [undo, setUndo] = useState<Undo | null>(null);
  const [canSave, setCanSave] = useState(true);

  useEffect(() => {
    if (!saveStore(store)) setCanSave(false);
  }, [store]);

  const change: StoreChange = (next, undoMessage) => {
    setUndo(undoMessage ? { message: undoMessage, previous: store } : null);
    setStore(next);
  };

  const undoLast = () => {
    if (!undo) return;
    setStore(undo.previous);
    setUndo(null);
  };

  const dismissUndo = () => setUndo(null);

  return { store, change, undo: undo?.message ?? null, undoLast, dismissUndo, canSave };
}
