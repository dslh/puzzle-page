import { useMemo } from 'react';
import { generateSecretCode, LAYOUT, type KeyMode } from './generator';
import { CELL_SIZE_MM, type PuzzleProps } from '../../../types/puzzle';
import styles from './SecretCode.module.css';

export type LetterCase = 'lower' | 'upper';

export interface SecretCodeConfig {
  /** Cipher pictures are arbitrary; phonics pictures start with their letter. */
  mode: KeyMode;
  letterCase: LetterCase;
  /** Pad the key with letters no word uses, filling its last row. */
  decoys: boolean;
  customWordsText?: string;
}

export default function SecretCode({
  gridWidth,
  gridHeight,
  seed,
  config,
}: PuzzleProps<SecretCodeConfig>) {
  const mode = config?.mode ?? 'cipher';
  const letterCase = config?.letterCase ?? 'upper';
  const decoys = config?.decoys ?? false;
  const customWordsText = config?.customWordsText ?? '';

  const innerWidth = gridWidth * CELL_SIZE_MM - 2 * LAYOUT.padding;
  const innerHeight = gridHeight * CELL_SIZE_MM - 2 * LAYOUT.padding;

  const puzzle = useMemo(
    () => generateSecretCode(seed, innerWidth, innerHeight, mode, decoys, customWordsText),
    [seed, innerWidth, innerHeight, mode, decoys, customWordsText]
  );

  const emojiFor = new Map(puzzle.key.map((k) => [k.letter, k.emoji]));
  const formatLetter = (l: string) => (letterCase === 'lower' ? l.toLowerCase() : l);

  if (puzzle.words.length === 0) {
    return <div className={styles.empty}>Make the puzzle bigger to fit a word</div>;
  }

  return (
    <div className={styles.container} style={{ padding: `${LAYOUT.padding}mm` }}>
      <div
        className={styles.key}
        style={{
          gridTemplateColumns: `repeat(${Math.min(puzzle.keyPerRow, puzzle.key.length)}, ${LAYOUT.keyCellWidth}mm)`,
          gridAutoRows: `${LAYOUT.keyCellHeight}mm`,
          marginBottom: `${LAYOUT.keyGap}mm`,
        }}
      >
        {puzzle.key.map((k) => (
          <div key={k.letter} className={styles.keyCell}>
            <span className={styles.keyEmoji} style={{ fontSize: `${LAYOUT.keyEmoji}mm` }}>
              {k.emoji}
            </span>
            <span className={styles.keyLetter} style={{ fontSize: `${LAYOUT.keyLetter}mm` }}>
              {formatLetter(k.letter)}
            </span>
          </div>
        ))}
      </div>

      <div className={styles.words}>
        {puzzle.words.map((word, i) => (
          <div key={i} className={styles.word} style={{ height: `${LAYOUT.wordRowHeight}mm` }}>
            {word.split('').map((letter, j) => (
              <div key={j} className={styles.slot} style={{ width: `${LAYOUT.slotWidth}mm` }}>
                <span style={{ fontSize: `${LAYOUT.wordEmoji}mm`, lineHeight: 1 }}>
                  {emojiFor.get(letter)}
                </span>
                <div
                  className={styles.writeBox}
                  style={{ width: `${LAYOUT.writeBox}mm`, height: `${LAYOUT.writeBox}mm` }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      {puzzle.skipped.length > 0 && (
        <div className={styles.note}>No room for {puzzle.skipped.join(', ')}</div>
      )}
    </div>
  );
}
