import { useMemo } from 'react';
import { LETTER_FORMS, getLetterForm, type LetterForm } from './letterForms';
import type { PuzzleProps } from '../../../types/puzzle';
import styles from './LetterFormation.module.css';

/** Empty letter means "let the seed pick", so rerolling gives a new one. */
export interface LetterFormationConfig {
  letter: string;
  /** Numbered start badges and direction arrows on the model letter. */
  guides: boolean;
  /** Grey letters to write over at the start of each practice line. */
  traceCount: 1 | 2 | 3;
}

const GRID_CELL_PX = 72; // 19mm at 96 DPI

/**
 * Badge padding the letterform data requires - `labelOffset` deliberately
 * pushes badges outside the 0..advance by 0..100 box. See letterForms.ts.
 */
const BADGE_PAD_LEFT = 14;
const BADGE_PAD_TOP = 22;

/** Keeps the first trace letter off the puzzle's left border. */
const GLYPH_INSET_PX = 10;

/**
 * Practice-line sizing. The target is roughly one grid cell, which puts the
 * cap height near 10mm - about right for a five-year-old writing capitals.
 *
 * Row count is derived first and the height divided out of it, rather than the
 * other way round: picking a height and then dividing to see how many fit is
 * at the mercy of floating point, and drops a row when the division lands a
 * hair under a whole number.
 */
const ROW_TARGET_PX = 76;
const ROW_MIN_PX = 56;
const ROW_MAX_PX = 88;

class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(max: number): number {
    return Math.floor(this.next() * max);
  }
}

interface GlyphProps {
  form: LetterForm;
  /** Cap height in px; the glyph scales from its 0..100 box to this. */
  height: number;
  strokeClass: string;
  showGuides?: boolean;
}

function Arrow({ x, y, dx, dy, scale }: { x: number; y: number; dx: number; dy: number; scale: number }) {
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const reach = 22 / scale;
  const tipX = x + ux * reach;
  const tipY = y + uy * reach;
  const backX = tipX - (ux * 9) / scale;
  const backY = tipY - (uy * 9) / scale;
  const wingX = (-uy * 5) / scale;
  const wingY = (ux * 5) / scale;
  return (
    <g className={styles.guide}>
      <line x1={x} y1={y} x2={backX} y2={backY} strokeWidth={2 / scale} />
      <polygon
        points={`${tipX},${tipY} ${backX + wingX},${backY + wingY} ${backX - wingX},${backY - wingY}`}
      />
    </g>
  );
}

function Glyph({ form, height, strokeClass, showGuides = false }: GlyphProps) {
  const scale = height / 100;
  const padL = showGuides ? BADGE_PAD_LEFT : 0;
  const padT = showGuides ? BADGE_PAD_TOP : 0;
  const boxW = form.advance + padL;
  const boxH = 100 + padT;

  return (
    <svg
      className={styles.glyph}
      width={boxW * scale}
      height={boxH * scale}
      viewBox={`${-padL} ${-padT} ${boxW} ${boxH}`}
    >
      {form.strokes.map((stroke, i) => (
        <path
          key={i}
          d={stroke.d}
          className={strokeClass}
          strokeWidth={9}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      ))}

      {showGuides &&
        form.strokes.map((stroke, i) => {
          const bx = stroke.start.x + (stroke.labelOffset?.x ?? 0);
          const by = stroke.start.y + (stroke.labelOffset?.y ?? 0);
          return (
            <g key={`g${i}`}>
              <Arrow x={stroke.start.x} y={stroke.start.y} dx={stroke.dir.x} dy={stroke.dir.y} scale={scale} />
              <circle cx={bx} cy={by} r={8} className={styles.badge} strokeWidth={1.8} />
              <text x={bx} y={by + 3.7} textAnchor="middle" fontSize={10.5} className={styles.badgeText}>
                {i + 1}
              </text>
            </g>
          );
        })}
    </svg>
  );
}

export default function LetterFormation({
  gridWidth,
  gridHeight,
  seed,
  config,
}: PuzzleProps<LetterFormationConfig>) {
  const requested = (config?.letter ?? '').toUpperCase();
  const showGuides = config?.guides ?? true;
  const traceCount = config?.traceCount ?? 3;

  // Only the random pick consumes the seed, so rerolling a chosen letter is a
  // no-op rather than a surprise.
  const form = useMemo(() => {
    const chosen = getLetterForm(requested);
    if (chosen) return chosen;
    return LETTER_FORMS[new SeededRandom(seed).nextInt(LETTER_FORMS.length)];
  }, [requested, seed]);

  const availableWidth = gridWidth * GRID_CELL_PX;
  const availableHeight = gridHeight * GRID_CELL_PX;

  // The model letter takes the top band; practice lines fill what's left. The
  // glyph is sized from the band rather than from the band minus badge padding,
  // so toggling guides off doesn't silently make the model bigger.
  const modelHeight = Math.min(availableHeight * 0.42, 112);
  const modelGlyphHeight = modelHeight * 0.8;
  const rowsHeight = availableHeight - modelHeight - 6;
  const rowCount = Math.max(1, Math.floor(rowsHeight / ROW_TARGET_PX));
  const rowHeight = Math.min(ROW_MAX_PX, Math.max(ROW_MIN_PX, rowsHeight / rowCount));

  // Capitals only, so no descender zone: cap line, dashed midline, baseline.
  const capHeight = rowHeight * 0.64;
  const glyphWidth = form.advance * (capHeight / 100);
  const gap = capHeight * 0.45;
  const slots = Math.max(1, Math.floor((availableWidth - GLYPH_INSET_PX) / (glyphWidth + gap)));
  const traced = Math.min(traceCount, slots);

  return (
    <div className={styles.container}>
      <div className={styles.model} style={{ height: `${modelHeight}px` }}>
        <Glyph
          form={form}
          height={modelGlyphHeight}
          strokeClass={styles.modelStroke}
          showGuides={showGuides}
        />
      </div>

      <div className={styles.rows}>
        {Array.from({ length: rowCount }, (_, r) => (
          <div key={r} className={styles.row} style={{ height: `${rowHeight}px` }}>
            <svg
              className={styles.rule}
              width={availableWidth - 8}
              height={capHeight}
              viewBox={`0 0 ${availableWidth - 8} ${capHeight}`}
            >
              <line x1={0} y1={0.5} x2={availableWidth - 8} y2={0.5} className={styles.capRule} />
              <line x1={0} y1={capHeight / 2} x2={availableWidth - 8} y2={capHeight / 2} className={styles.midRule} />
              <line x1={0} y1={capHeight - 0.5} x2={availableWidth - 8} y2={capHeight - 0.5} className={styles.baseRule} />
            </svg>
            <div
              className={styles.rowGlyphs}
              style={{ gap: `${gap}px`, height: `${capHeight}px`, paddingLeft: `${GLYPH_INSET_PX}px` }}
            >
              {Array.from({ length: traced }, (_, i) => (
                <Glyph key={i} form={form} height={capHeight} strokeClass={styles.traceStroke} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
