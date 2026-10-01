import { useMemo } from 'react';
import {
  generatePatternRows,
  requiredRowLength,
  DEFAULT_PATTERN_OPTIONS,
  type PatternItem,
  type PatternOptions,
  type Shape,
} from './generator';
import type { PuzzleProps } from '../../../types/puzzle';
import { CELL_SIZE_MM } from '../../../types/puzzle';
import styles from './PatternSequence.module.css';

export type PatternSequenceConfig = PatternOptions;

// Layout in mm - keep in step with PatternSequence.module.css
const CONTAINER_PADDING_MM = 1.5;
const ROW_GAP_MM = 2;
const ROW_PADDING_MM = 1.8; // padding + border
const ITEM_GAP_MM = 2.5;
/** Large enough for a 5-7 year old to draw a star into */
const MAX_ITEM_MM = 12;
const MAX_ITEMS = 12;

/** Outline of each shape in a 100×100 viewBox */
const SHAPE_PATHS: Record<Shape, string> = {
  square: 'M17 17H83V83H17Z',
  rectangle: 'M6 28H94V72H6Z',
  circle: 'M50 12A38 38 0 1 1 50 88A38 38 0 1 1 50 12Z',
  oval: 'M50 26A45 24 0 1 1 50 74A45 24 0 1 1 50 26Z',
  triangle: 'M50 10L93 86H7Z',
  diamond: 'M50 5L84 50L50 95L16 50Z',
  hexagon: hexagonPath(),
  star: starPath(),
};

function hexagonPath(): string {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    return `${(50 + 44 * Math.cos(a)).toFixed(1)} ${(50 + 44 * Math.sin(a)).toFixed(1)}`;
  });
  return `M${pts.join('L')}Z`;
}

function starPath(): string {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 === 0 ? 47 : 19;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    return `${(50 + r * Math.cos(a)).toFixed(1)} ${(55 + r * Math.sin(a)).toFixed(1)}`;
  });
  return `M${pts.join('L')}Z`;
}

function ItemSvg({ item, blank, size }: { item: PatternItem; blank: boolean; size: number }) {
  const style = { width: `${size}mm`, height: `${size}mm` };

  if (item.kind === 'colour') {
    return (
      <svg viewBox="0 0 100 100" style={style} className={styles.item}>
        <circle
          cx="50"
          cy="50"
          r="45"
          fill={blank ? 'white' : item.colour}
          stroke="black"
          strokeWidth={blank ? 5 : 2.5}
        />
      </svg>
    );
  }

  if (blank) {
    // An empty box to draw the missing shape into - not a shape outline,
    // which would give the answer away
    return (
      <svg viewBox="0 0 100 100" style={style} className={styles.item}>
        <rect
          x="3"
          y="3"
          width="94"
          height="94"
          rx="8"
          fill="white"
          stroke="#555"
          strokeWidth="3"
          strokeDasharray="10 7"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 100 100" style={style} className={styles.item}>
      <path
        d={SHAPE_PATHS[item.shape]}
        fill={item.filled ? 'black' : 'none'}
        stroke="black"
        strokeWidth="6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PatternSequence({
  gridWidth = 8,
  gridHeight = 2,
  seed,
  config,
}: PuzzleProps<PatternSequenceConfig>) {
  const style = config?.style ?? DEFAULT_PATTERN_OPTIONS.style;
  const families = config?.families ?? DEFAULT_PATTERN_OPTIONS.families;
  const fill = config?.fill ?? DEFAULT_PATTERN_OPTIONS.fill;
  const gaps = config?.gaps ?? DEFAULT_PATTERN_OPTIONS.gaps;

  // One row per grid cell of height; as many items as fit across, shrinking
  // them if that's too few for any of the chosen patterns to be solvable
  const rowContentMm =
    (gridHeight * CELL_SIZE_MM - 2 * CONTAINER_PADDING_MM - (gridHeight - 1) * ROW_GAP_MM) /
      gridHeight -
    2 * ROW_PADDING_MM;
  const rowWidthMm = gridWidth * CELL_SIZE_MM - 2 * CONTAINER_PADDING_MM - 2 * ROW_PADDING_MM;
  const fitsAcross = (size: number) =>
    Math.floor((rowWidthMm + ITEM_GAP_MM) / (size + ITEM_GAP_MM));

  const fullSize = Math.min(MAX_ITEM_MM, rowContentMm);
  const required = requiredRowLength({ style, families, fill, gaps });
  const length = Math.min(MAX_ITEMS, Math.max(fitsAcross(fullSize), required));
  const itemSize = Math.min(fullSize, (rowWidthMm + ITEM_GAP_MM) / length - ITEM_GAP_MM);

  const rows = useMemo(
    () => generatePatternRows(seed, gridHeight, length, { style, families, fill, gaps }),
    [seed, gridHeight, length, style, families, fill, gaps]
  );

  return (
    <div className={styles.container}>
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className={styles.row}>
          <div className={styles.itemsContainer}>
            {row.items.map((item, index) => (
              <ItemSvg key={index} item={item} blank={row.blanks.includes(index)} size={itemSize} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
