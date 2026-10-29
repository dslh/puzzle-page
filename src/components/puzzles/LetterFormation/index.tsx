import { useMemo } from 'react';
import { LETTER_FORMS, LOWER_FORMS, NUMBER_FORMS, getLetterForm, type LetterForm } from './letterForms';
import type { PuzzleProps } from '../../../types/puzzle';
import styles from './LetterFormation.module.css';
import { SeededRandom } from '../../../utils/random';

/** Empty letter means "let the seed pick", so rerolling gives a new one. */
export interface LetterFormationConfig {
  /** A capital, a lower-case letter or a digit. For pairs, the capital. */
  letter: string;
  /**
   * Which set the config bar offers, and the random pick draws from.
   * 'letters' is capitals: it predates lower case, and saved pages keep it.
   * 'pairs' is each capital with its lower case beside it: Aa.
   */
  set: 'letters' | 'lowercase' | 'pairs' | 'numbers';
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

/**
 * Lower case needs room under the baseline, so its rows are taller and the
 * letter takes more of them: the x-height lands near 8mm, the ascenders 16mm.
 */
const LOWER_ROW_TARGET_PX = 92;
const LOWER_ROW_MIN_PX = 68;
const LOWER_ROW_MAX_PX = 104;

/** The lower-case box runs down to the descender line. See letterForms.ts. */
const LOWER_DEPTH = 150;

/**
 * A short letter like "a" is cropped to its x-height for the model, which
 * would draw it twice as big as a capital. Capped, so it stays in proportion
 * with its badges.
 */
const MODEL_MAX_ZOOM = 1.4;

/** Space inside a pair, Aa, against the cap height; pairs are spaced as letters are. */
const PAIR_GAP = 0.12;

const POOLS = { letters: LETTER_FORMS, lowercase: LOWER_FORMS, pairs: LETTER_FORMS, numbers: NUMBER_FORMS };

interface GlyphProps {
  form: LetterForm;
  /** Cap height in px; the glyph scales from its 0..100 box to this. */
  height: number;
  /** The slice of the box to draw, top to bottom. */
  top?: number;
  bottom?: number;
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

function Glyph({ form, height, top = 0, bottom = 100, strokeClass, showGuides = false }: GlyphProps) {
  const scale = height / 100;
  const padL = showGuides ? BADGE_PAD_LEFT : 0;
  const padT = showGuides ? BADGE_PAD_TOP : 0;
  const boxW = form.advance + padL;
  const boxH = bottom - top + padT;

  return (
    <svg
      className={styles.glyph}
      width={boxW * scale}
      height={boxH * scale}
      viewBox={`${-padL} ${top - padT} ${boxW} ${boxH}`}
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
        form.strokes.flatMap((stroke, i) =>
          (stroke.turns ?? []).map((turn, j) => (
            <Arrow key={`t${i}-${j}`} x={turn.at.x} y={turn.at.y} dx={turn.dir.x} dy={turn.dir.y} scale={scale} />
          ))
        )}

      {showGuides &&
        form.strokes.map((stroke, i) => {
          const bx = stroke.start.x + (stroke.labelOffset?.x ?? 0);
          const by = stroke.start.y + (stroke.labelOffset?.y ?? 0);
          // A dot has nowhere to go, so no arrow
          const moves = stroke.dir.x !== 0 || stroke.dir.y !== 0;
          return (
            <g key={`g${i}`}>
              {moves && (
                <Arrow x={stroke.start.x} y={stroke.start.y} dx={stroke.dir.x} dy={stroke.dir.y} scale={scale} />
              )}
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
  const requested = config?.letter ?? '';
  const set = config?.set ?? 'letters';
  // Pairs use the lower-case lines too: the capitals reach the ascender line
  const lower = set === 'lowercase' || set === 'pairs';
  const showGuides = config?.guides ?? true;
  const traceCount = config?.traceCount ?? 3;

  // Only the random pick consumes the seed, so rerolling a chosen letter is a
  // no-op rather than a surprise.
  const forms = useMemo(() => {
    const pool = POOLS[set];
    const form =
      getLetterForm(set === 'pairs' ? requested.toUpperCase() : requested) ??
      pool[new SeededRandom(seed).nextInt(pool.length)];
    return set === 'pairs' ? [form, getLetterForm(form.char.toLowerCase())!] : [form];
  }, [requested, set, seed]);

  const availableWidth = gridWidth * GRID_CELL_PX;
  const availableHeight = gridHeight * GRID_CELL_PX;

  // The model letter takes the top band; practice lines fill what's left. The
  // glyph is sized from the band rather than from the band minus badge padding,
  // so toggling guides off doesn't silently make the model bigger.
  const modelHeight = Math.min(availableHeight * 0.42, 112);
  const modelBand = modelHeight * 0.8;
  // A pair shares one crop, so the two letters sit on the same baseline
  const modelTop = Math.min(...forms.map(f => f.top ?? 0));
  const modelBottom = Math.max(...forms.map(f => f.bottom ?? 100));
  // ...and may have to shrink to fit across a narrow puzzle
  const modelUnits = forms.reduce((sum, f) => sum + f.advance + (showGuides ? BADGE_PAD_LEFT : 0), 0);
  const modelGap = (forms.length - 1) * PAIR_GAP * 100;
  const modelGlyphHeight = Math.min(
    (modelBand * 100) / (modelBottom - modelTop),
    modelBand * MODEL_MAX_ZOOM,
    ((availableWidth - 16) * 100) / (modelUnits + modelGap)
  );
  const rowsHeight = availableHeight - modelHeight - 6;
  const rowTarget = lower ? LOWER_ROW_TARGET_PX : ROW_TARGET_PX;
  const rowCount = Math.max(1, Math.floor(rowsHeight / rowTarget));
  const rowHeight = Math.min(
    lower ? LOWER_ROW_MAX_PX : ROW_MAX_PX,
    Math.max(lower ? LOWER_ROW_MIN_PX : ROW_MIN_PX, rowsHeight / rowCount)
  );

  // Cap line (the ascender line for lower case), dashed midline (the
  // x-height), baseline, and for lower case a descender line under it.
  const capHeight = rowHeight * (lower ? 0.6 : 0.64);
  const lineDepth = lower ? (capHeight * LOWER_DEPTH) / 100 : capHeight;
  const pairGap = capHeight * PAIR_GAP;
  const unitWidth =
    forms.reduce((sum, f) => sum + f.advance, 0) * (capHeight / 100) + (forms.length - 1) * pairGap;
  const gap = capHeight * 0.45;
  const slots = Math.max(1, Math.floor((availableWidth - GLYPH_INSET_PX) / (unitWidth + gap)));
  const traced = Math.min(traceCount, slots);

  return (
    <div className={styles.container}>
      <div
        className={styles.model}
        style={{ height: `${modelHeight}px`, gap: `${modelGlyphHeight * PAIR_GAP}px` }}
      >
        {forms.map(form => (
          <Glyph
            key={form.char}
            form={form}
            height={modelGlyphHeight}
            top={modelTop}
            bottom={modelBottom}
            strokeClass={styles.modelStroke}
            showGuides={showGuides}
          />
        ))}
      </div>

      <div className={styles.rows}>
        {Array.from({ length: rowCount }, (_, r) => (
          <div key={r} className={styles.row} style={{ height: `${rowHeight}px` }}>
            <svg
              className={styles.rule}
              width={availableWidth - 8}
              height={lineDepth}
              viewBox={`0 0 ${availableWidth - 8} ${lineDepth}`}
            >
              <line x1={0} y1={0.5} x2={availableWidth - 8} y2={0.5} className={styles.capRule} />
              <line x1={0} y1={capHeight / 2} x2={availableWidth - 8} y2={capHeight / 2} className={styles.midRule} />
              <line x1={0} y1={capHeight - 0.5} x2={availableWidth - 8} y2={capHeight - 0.5} className={styles.baseRule} />
              {lower && (
                <line x1={0} y1={lineDepth - 0.5} x2={availableWidth - 8} y2={lineDepth - 0.5} className={styles.capRule} />
              )}
            </svg>
            <div
              className={styles.rowGlyphs}
              style={{ gap: `${gap}px`, height: `${lineDepth}px`, paddingLeft: `${GLYPH_INSET_PX}px` }}
            >
              {Array.from({ length: traced }, (_, i) => (
                <div key={i} className={styles.unit} style={{ gap: `${pairGap}px` }}>
                  {forms.map(form => (
                    <Glyph
                      key={form.char}
                      form={form}
                      height={capHeight}
                      bottom={lower ? LOWER_DEPTH : 100}
                      strokeClass={styles.traceStroke}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
