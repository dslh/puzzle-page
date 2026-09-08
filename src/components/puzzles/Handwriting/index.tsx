import { useMemo } from 'react';
import { generateHandwriting, type HandwritingRow } from './generator';
import type { PuzzleProps } from '../../../types/puzzle';
import styles from './Handwriting.module.css';

export type HandwritingMode = 'trace' | 'copy' | 'missing';
export type LetterCase = 'lower' | 'upper';

export interface HandwritingConfig {
  mode: HandwritingMode;
  letterCase: LetterCase;
  customWordsText?: string;
}

const GRID_CELL_PX = 72; // 19mm at 96 DPI

/**
 * Cap/ascender height of the sans-serif stack in Handwriting.module.css, as a
 * fraction of the font size. Letters are sized from this so that capitals and
 * ascenders (b, d, h, l) meet the top rule and descenders (g, p, y) drop below
 * the baseline, which is the whole point of ruled practice paper.
 */
const CAP_HEIGHT_RATIO = 0.72;

// Width of each letter cell as a fraction of the font size. Deliberately wider
// than the font's natural spacing - young writers need the elbow room, and the
// even spacing is what a fill-in-the-blank exercise wants anyway.
const LETTER_ADVANCE_RATIO = 0.82;

// In copy mode the model word and the child's attempt share one rule, so a word
// may take up at most this fraction of the line.
const COPY_MODEL_SHARE = 0.55;

const MAX_TRACE_REPEATS = 4;

interface LetterOptions {
  x: number;
  baseline: number;
  advance: number;
  fontSize: number;
  className: string;
  skipIndex?: number;
}

function renderLetters(word: string, keyPrefix: string, o: LetterOptions) {
  return word.split('').map((char, i) =>
    i === o.skipIndex ? null : (
      <text
        key={`${keyPrefix}-${i}`}
        x={o.x + i * o.advance + o.advance / 2}
        y={o.baseline}
        fontSize={o.fontSize}
        textAnchor="middle"
        className={o.className}
      >
        {char}
      </text>
    )
  );
}

export default function Handwriting({
  gridWidth,
  gridHeight,
  seed,
  config,
}: PuzzleProps<HandwritingConfig>) {
  const mode = config?.mode ?? 'trace';
  const letterCase = config?.letterCase ?? 'lower';
  const customWordsText = config?.customWordsText ?? '';

  const availableWidth = gridWidth * GRID_CELL_PX;
  const availableHeight = gridHeight * GRID_CELL_PX;

  // One practice line per grid row. This keeps letters the same physical size
  // however the puzzle is resized - a taller box means more words to practise,
  // not bigger ones.
  const rowCount = Math.max(2, Math.min(10, gridHeight));
  const rowHeight = availableHeight / rowCount;

  // Three equal zones: top rule -> midline -> baseline -> descender rule
  const ruleHeight = Math.min(rowHeight * 0.72, 68);
  const zone = ruleHeight / 3;
  const fontSize = (2 * zone) / CAP_HEIGHT_RATIO;
  const advance = fontSize * LETTER_ADVANCE_RATIO;
  const baseline = 2 * zone;

  const clueWidth = Math.min(rowHeight * 0.8, 56);
  const ruleWidth = Math.max(40, availableWidth - clueWidth - 12);

  const usableWidth = mode === 'copy' ? ruleWidth * COPY_MODEL_SHARE : ruleWidth;
  const maxWordLength = Math.max(3, Math.floor(usableWidth / advance));

  const puzzle = useMemo(
    () => generateHandwriting(seed, rowCount, maxWordLength, customWordsText),
    [seed, rowCount, maxWordLength, customWordsText]
  );

  // Trace repeats are laid out on a uniform slot grid sized by the longest word
  // on the sheet, so every row gets the same number of models and they line up
  // vertically instead of raggedly following each word's own width.
  const traceGap = advance;
  const traceSlot =
    puzzle.rows.reduce((longest, r) => Math.max(longest, r.word.length), 0) * advance + traceGap;
  const traceRepeats = Math.max(
    1,
    Math.min(MAX_TRACE_REPEATS, Math.floor((ruleWidth + traceGap) / traceSlot))
  );

  const renderExercise = (row: HandwritingRow) => {
    const word = letterCase === 'lower' ? row.word.toLowerCase() : row.word;
    const shared = { baseline, advance, fontSize };

    if (mode === 'trace') {
      return Array.from({ length: traceRepeats }, (_, r) =>
        renderLetters(word, `trace-${r}`, {
          ...shared,
          x: r * traceSlot,
          className: styles.traceLetter,
        })
      );
    }

    if (mode === 'copy') {
      return renderLetters(word, 'copy', {
        ...shared,
        x: 0,
        className: styles.modelLetter,
      });
    }

    const blankCentre = row.missingIndex * advance + advance / 2;
    const blankOffset = Math.max(2, zone * 0.12);
    return (
      <>
        {renderLetters(word, 'missing', {
          ...shared,
          x: 0,
          className: styles.modelLetter,
          skipIndex: row.missingIndex,
        })}
        <line
          x1={blankCentre - advance * 0.35}
          x2={blankCentre + advance * 0.35}
          y1={baseline + blankOffset}
          y2={baseline + blankOffset}
          className={styles.blank}
        />
      </>
    );
  };

  return (
    <div className={styles.container}>
      {puzzle.rows.map((row, i) => (
        <div key={i} className={styles.row} style={{ height: `${rowHeight}px` }}>
          <div
            className={styles.clue}
            style={{ width: `${clueWidth}px`, fontSize: `${clueWidth * 0.6}px` }}
          >
            {row.emoji}
          </div>
          <svg
            className={styles.rule}
            width={ruleWidth}
            height={ruleHeight}
            viewBox={`0 0 ${ruleWidth} ${ruleHeight}`}
          >
            <line x1={0} x2={ruleWidth} y1={0.5} y2={0.5} className={styles.topRule} />
            <line x1={0} x2={ruleWidth} y1={zone} y2={zone} className={styles.midRule} />
            <line
              x1={0}
              x2={ruleWidth}
              y1={baseline}
              y2={baseline}
              className={styles.baseRule}
            />
            <line
              x1={0}
              x2={ruleWidth}
              y1={ruleHeight - 0.5}
              y2={ruleHeight - 0.5}
              className={styles.descenderRule}
            />
            {renderExercise(row)}
          </svg>
        </div>
      ))}
    </div>
  );
}
