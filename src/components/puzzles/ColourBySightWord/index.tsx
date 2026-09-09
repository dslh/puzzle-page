import { useMemo } from 'react';
import {
  generateColourBySightWord,
  pickPicture,
  type KeyEntry,
} from './generator';
import type { PuzzleProps } from '../../../types/puzzle';
import styles from './ColourBySightWord.module.css';

export type ColourCount = 2 | 3 | 4;
export type LetterCase = 'lower' | 'upper';

export interface ColourBySightWordConfig {
  colourCount: ColourCount;
  letterCase: LetterCase;
  customWordsText?: string;
}

const GRID_CELL_PX = 72; // 19mm at 96 DPI
const CONTAINER_PADDING_PX = 4;
const KEY_GAP_PX = 8;
const KEY_ROW_GAP_PX = 5;
const KEY_ENTRY_GAP_PX = 8;

/**
 * Average glyph width as a fraction of the font size, for the rounded sans
 * stack in the stylesheet. Capitals are much wider than lowercase, so cells and
 * key entries are measured with the ratio for the case actually being printed -
 * otherwise switching to ABC overflows everything.
 */
const CHAR_WIDTH_RATIO: Record<LetterCase, number> = {
  lower: 0.62,
  upper: 0.76,
};

/** Fraction of a cell a word may occupy, leaving a margin to colour around. */
const WORD_FIT = 0.84;

/**
 * Smallest word we're willing to print. Narrow cells pull shorter words out of
 * the list rather than shrinking the type past this.
 */
const MIN_WORD_FONT_PX = 11;

/** Longest word the generator may pick, and the longest colour name in the key. */
const MAX_WORD_CHARS = 8;
const MAX_COLOUR_CHARS = 6;

/** Cells may be this much wider than tall, and this much taller than wide. */
const MAX_CELL_ASPECT = 1.6;
const MAX_CELL_TALLNESS = 1.35;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Sight words are printed as they appear in books, so lowercase by default -
 * except "I", which is never lowercase anywhere.
 */
function displayWord(word: string, letterCase: LetterCase): string {
  if (letterCase === 'upper') return word.toUpperCase();
  const lower = word.toLowerCase();
  return lower === 'i' ? 'I' : lower;
}

function entryWidth(
  wordChars: number,
  colourChars: number,
  fontSize: number,
  charRatio: number
): number {
  const text = (wordChars + colourChars) * fontSize * charRatio;
  const equals = fontSize * 1.1; // the "=" plus the space either side of it
  const padding = fontSize * 1.2 + 4; // box padding plus its border
  return text + equals + padding;
}

function keyHeightFor(rowCount: number, fontSize: number): number {
  const entryHeight = fontSize * 1.7 + 6;
  return rowCount * entryHeight + (rowCount - 1) * KEY_ROW_GAP_PX;
}

/** Pack the key into explicit rows, so the height reserved for it is exact. */
function layoutKeyRows(
  entries: KeyEntry[],
  availableWidth: number,
  fontSize: number,
  charRatio: number
): KeyEntry[][] {
  const rows: KeyEntry[][] = [];
  let current: KeyEntry[] = [];
  let used = 0;

  for (const entry of entries) {
    const width = entryWidth(entry.word.length, entry.colour.length, fontSize, charRatio);
    const needed = current.length === 0 ? width : used + KEY_ENTRY_GAP_PX + width;
    if (current.length > 0 && needed > availableWidth) {
      rows.push(current);
      current = [entry];
      used = width;
    } else {
      current.push(entry);
      used = needed;
    }
  }
  if (current.length > 0) rows.push(current);

  return rows;
}

/** Largest cell that fits, kept close to square so the picture still reads. */
function cellSize(availableWidth: number, availableHeight: number, cols: number, rows: number) {
  const width = Math.floor(
    Math.min(availableWidth / cols, (availableHeight / rows) * MAX_CELL_ASPECT)
  );
  const height = Math.floor(Math.min(availableHeight / rows, width * MAX_CELL_TALLNESS));
  return { width: Math.max(8, width), height: Math.max(8, height) };
}

export default function ColourBySightWord({
  gridWidth,
  gridHeight,
  seed,
  config,
}: PuzzleProps<ColourBySightWordConfig>) {
  const colourCount = config?.colourCount ?? 3;
  const letterCase = config?.letterCase ?? 'lower';
  const customWordsText = config?.customWordsText ?? '';

  const charRatio = CHAR_WIDTH_RATIO[letterCase];
  const boxWidth = gridWidth * GRID_CELL_PX - CONTAINER_PADDING_PX * 2;
  const boxHeight = gridHeight * GRID_CELL_PX - CONTAINER_PADDING_PX * 2;

  const picture = useMemo(() => pickPicture(seed), [seed]);
  const cols = picture.rows[0].length;
  const rows = picture.rows.length;

  const keyFontSize = clamp(Math.round(boxWidth / 26), 11, 17);

  // The key's real height depends on the words, and the words depend on how
  // wide a cell is - which depends on the key's height. Break the loop with a
  // worst-case key: the real one is never taller, so the real cells are never
  // narrower than the ones the word length was chosen for.
  const worstEntry = entryWidth(MAX_WORD_CHARS, MAX_COLOUR_CHARS, keyFontSize, charRatio);
  const worstPerRow = Math.max(1, Math.floor(boxWidth / worstEntry));
  const worstKeyHeight = keyHeightFor(Math.ceil(colourCount / worstPerRow), keyFontSize);

  const provisional = cellSize(
    boxWidth,
    boxHeight - worstKeyHeight - KEY_GAP_PX,
    cols,
    rows
  );
  const maxWordLength = clamp(
    Math.floor((provisional.width * WORD_FIT) / (MIN_WORD_FONT_PX * charRatio)),
    3,
    MAX_WORD_CHARS
  );

  const puzzle = useMemo(
    () =>
      generateColourBySightWord(picture, seed, colourCount, maxWordLength, customWordsText),
    [picture, seed, colourCount, maxWordLength, customWordsText]
  );

  const keyRows = layoutKeyRows(puzzle.key, boxWidth, keyFontSize, charRatio);
  const keyHeight = keyHeightFor(keyRows.length, keyFontSize);
  const cell = cellSize(boxWidth, boxHeight - keyHeight - KEY_GAP_PX, cols, rows);

  const longestWord = puzzle.key.reduce((n, entry) => Math.max(n, entry.word.length), 1);
  const wordFontSize = Math.max(
    7,
    Math.min(cell.height * 0.44, (cell.width * WORD_FIT) / (longestWord * charRatio))
  );

  return (
    <div className={styles.container}>
      <div className={styles.key} style={{ height: `${keyHeight}px`, gap: `${KEY_ROW_GAP_PX}px` }}>
        {keyRows.map((row, rowIndex) => (
          <div key={rowIndex} className={styles.keyRow} style={{ gap: `${KEY_ENTRY_GAP_PX}px` }}>
            {row.map(entry => (
              <span
                key={entry.word}
                className={styles.keyEntry}
                style={{ fontSize: `${keyFontSize}px`, padding: `2px ${keyFontSize * 0.6}px` }}
              >
                <span className={styles.keyWord}>{displayWord(entry.word, letterCase)}</span>
                <span className={styles.keyEquals}>=</span>
                <span className={styles.keyColour} style={{ color: entry.hex }}>
                  {displayWord(entry.colour, letterCase)}
                </span>
              </span>
            ))}
          </div>
        ))}
      </div>

      <div className={styles.gridWrap}>
        <div
          className={styles.grid}
          style={{
            gridTemplateColumns: `repeat(${puzzle.cols}, ${cell.width}px)`,
            gridTemplateRows: `repeat(${puzzle.rows}, ${cell.height}px)`,
          }}
        >
          {puzzle.cells.map((region, index) => {
            const edges = [
              index % puzzle.cols === puzzle.cols - 1 ? styles.noRight : '',
              index >= puzzle.cells.length - puzzle.cols ? styles.noBottom : '',
            ].join(' ');
            return (
              <div
                key={index}
                className={`${styles.cell} ${edges}`}
                style={{ fontSize: `${wordFontSize.toFixed(1)}px` }}
              >
                {displayWord(puzzle.key[region].word, letterCase)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
