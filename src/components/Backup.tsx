import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { parseStore, type Store } from '../profiles/store';
import type { StoreChange } from '../profiles/useStore';
import styles from './Backup.module.css';

interface BackupProps {
  store: Store;
  onChange: StoreChange;
  canSave: boolean;
}

/**
 * Pages and profiles live in this browser only, so clearing it would lose
 * them. A backup file is the way to keep them safe or move them.
 */
export default function Backup({ store, onChange, canSave }: BackupProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSave = () => {
    const blob = new Blob([JSON.stringify(store, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `puzzle-page-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage(null);
  };

  const handleLoad = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    let loaded: Store | null = null;
    try {
      loaded = parseStore(JSON.parse(await file.text()));
    } catch {
      // Not JSON: reported below
    }
    if (!loaded) {
      setMessage('That file isn’t a Puzzle Page backup. Choose a file saved with “Save a backup”.');
      return;
    }
    setMessage(null);
    onChange(loaded, 'Loaded the backup');
  };

  return (
    <section className={styles.backup} aria-labelledby="backup-label">
      <h2 id="backup-label" className={styles.heading}>Keeping your pages</h2>
      <p className={styles.text}>
        {canSave
          ? 'Pages and children are kept in this browser. Save a backup to keep them safe if it’s cleared.'
          : 'This browser isn’t keeping pages, so print before you close it.'}
      </p>
      <div className={styles.actions}>
        <button type="button" className={styles.button} onClick={handleSave}>
          Save a backup
        </button>
        <button type="button" className={styles.button} onClick={() => fileRef.current?.click()}>
          Load a backup
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className={styles.file}
          onChange={handleLoad}
          tabIndex={-1}
          aria-hidden="true"
        />
      </div>
      {message && <p className={styles.error} role="alert">{message}</p>}
    </section>
  );
}
