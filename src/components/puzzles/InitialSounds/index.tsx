import { useMemo } from 'react';
import { generateInitialSounds } from './generator';
import { CELL_SIZE_MM, type PuzzleProps } from '../../../types/puzzle';
import styles from './InitialSounds.module.css';

export type InitialSoundsMode = 'circle' | 'write';
export type LetterCase = 'lower' | 'upper';

export interface InitialSoundsConfig {
  mode: InitialSoundsMode;
  letterCase: LetterCase;
  /** Limit the pictures to these starting letters, e.g. "s a t p i n". */
  lettersText?: string;
}

// Each picture gets a tile at least this big, so three letters fit side by
// side under it at a size a five year old can circle.
const MIN_TILE_MM = 30;
const PADDING_MM = 2;

export default function InitialSounds({
  gridWidth,
  gridHeight,
  seed,
  config,
}: PuzzleProps<InitialSoundsConfig>) {
  const mode = config?.mode ?? 'circle';
  const letterCase = config?.letterCase ?? 'lower';
  const lettersText = config?.lettersText ?? '';

  const innerWidth = gridWidth * CELL_SIZE_MM - 2 * PADDING_MM;
  const innerHeight = gridHeight * CELL_SIZE_MM - 2 * PADDING_MM;
  const cols = Math.max(1, Math.floor(innerWidth / MIN_TILE_MM));
  const rows = Math.max(1, Math.floor(innerHeight / MIN_TILE_MM));
  const tileWidth = innerWidth / cols;
  const tileHeight = innerHeight / rows;

  const puzzle = useMemo(
    () => generateInitialSounds(seed, cols * rows, lettersText),
    [seed, cols, rows, lettersText]
  );

  const emojiSize = Math.min(tileWidth * 0.5, tileHeight * 0.45);
  const letterSize = Math.min(tileWidth / 5, tileHeight * 0.22);
  const boxSize = letterSize * 1.6;
  const formatLetter = (l: string) => (letterCase === 'lower' ? l.toLowerCase() : l);

  if (puzzle.items.length === 0) {
    return (
      <div className={styles.empty}>
        No pictures start with {lettersText.trim() || 'those letters'}
      </div>
    );
  }

  return (
    <div
      className={styles.container}
      style={{
        padding: `${PADDING_MM}mm`,
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
      }}
    >
      {puzzle.items.map((item, i) => (
        <div key={i} className={styles.tile}>
          <div className={styles.picture} style={{ fontSize: `${emojiSize}mm` }}>
            {item.emoji}
          </div>
          {mode === 'circle' ? (
            <div className={styles.choices} style={{ fontSize: `${letterSize}mm` }}>
              {item.choices.map((choice) => (
                <span key={choice} className={styles.choice}>
                  {formatLetter(choice)}
                </span>
              ))}
            </div>
          ) : (
            <div
              className={styles.writeBox}
              style={{ width: `${boxSize}mm`, height: `${boxSize}mm` }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
