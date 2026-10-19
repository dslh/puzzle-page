import styles from './LeftOutNotice.module.css';

/** Typed-in words a puzzle couldn't use, and why. */
export interface LeftOutWords {
  /** Longer than this size of puzzle can hold. */
  tooLong: string[];
  /** Short enough, but the sheet was already full. */
  noRoom: string[];
}

/**
 * Names the custom words a puzzle left off the sheet, so a word that doesn't
 * fit isn't mistaken for the field being ignored. On screen only: it sits over
 * the puzzle's bottom edge and never prints.
 */
export default function LeftOutNotice({ words }: { words: LeftOutWords }) {
  const { tooLong, noRoom } = words;
  if (tooLong.length === 0 && noRoom.length === 0) return null;

  return (
    <div className={styles.notice}>
      {tooLong.length > 0 && <div>Too long for this size: {tooLong.join(', ')}</div>}
      {noRoom.length > 0 && <div>No room for: {noRoom.join(', ')}</div>}
    </div>
  );
}
