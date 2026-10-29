import { CELL_SIZE_MM } from '../../../types/puzzle';
import type { Point } from '../Maze/grids';
import { LETTER_FORMS, getLetterForm, type LetterForm } from '../LetterFormation/letterForms';
import { SeededRandom } from '../../../utils/random';
import { CLEAR_SPACING, CORNER_TURN, MARGIN, MIN_SPACING, SPACING, dist, gapsFor, pathLength, pointAlong, turnAt, withoutOverlaps } from './spacing';
import type { DotMarkerPuzzle } from './generator';

/** The most letters a word can have; more won't fit at a size worth dotting. */
export const MAX_LETTERS = 12;

/** Letter Formation's strokes as lines of points, in its 0..advance by 0..100 box. */
function flatten(d: string): Point[] {
  const tokens = d.match(/[MLAC]|-?\d*\.?\d+(?:e-?\d+)?/g) ?? [];
  const points: Point[] = [];
  let i = 0;
  let command = '';
  const num = () => Number(tokens[i++]);
  let at: Point = { x: 0, y: 0 };
  while (i < tokens.length) {
    // A number where a command should be repeats the last command
    if (/[MLAC]/.test(tokens[i])) command = tokens[i++];
    if (command === 'M' || command === 'L') {
      at = { x: num(), y: num() };
      points.push(at);
    } else if (command === 'C') {
      const [c1, c2, end] = [{ x: num(), y: num() }, { x: num(), y: num() }, { x: num(), y: num() }];
      const from = at;
      for (let s = 1; s <= 24; s++) {
        const t = s / 24;
        const u = 1 - t;
        points.push({
          x: u * u * u * from.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * end.x,
          y: u * u * u * from.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * end.y,
        });
      }
      at = end;
    } else if (command === 'A') {
      const [rx, ry, rotation, large, sweep] = [num(), num(), num(), num(), num()];
      const end = { x: num(), y: num() };
      points.push(...arcPoints(at, end, rx, ry, (rotation * Math.PI) / 180, large === 1, sweep === 1));
      at = end;
    } else {
      throw new Error(`Unexpected path command ${command} in ${d}`);
    }
  }
  return points;
}

/** An SVG arc's points after its start, by the SVG spec's centre conversion. */
function arcPoints(from: Point, to: Point, rx: number, ry: number, phi: number, large: boolean, sweep: boolean): Point[] {
  const [cos, sin] = [Math.cos(phi), Math.sin(phi)];
  const dx = (from.x - to.x) / 2;
  const dy = (from.y - to.y) / 2;
  const x1 = cos * dx + sin * dy;
  const y1 = -sin * dx + cos * dy;
  const lambda = (x1 * x1) / (rx * rx) + (y1 * y1) / (ry * ry);
  if (lambda > 1) {
    rx *= Math.sqrt(lambda);
    ry *= Math.sqrt(lambda);
  }
  const num = rx * rx * ry * ry - rx * rx * y1 * y1 - ry * ry * x1 * x1;
  const coef = (large !== sweep ? 1 : -1) * Math.sqrt(Math.max(0, num / (rx * rx * y1 * y1 + ry * ry * x1 * x1)));
  const cx1 = (coef * rx * y1) / ry;
  const cy1 = (-coef * ry * x1) / rx;
  const cx = cos * cx1 - sin * cy1 + (from.x + to.x) / 2;
  const cy = sin * cx1 + cos * cy1 + (from.y + to.y) / 2;
  const start = Math.atan2((y1 - cy1) / ry, (x1 - cx1) / rx);
  let delta = Math.atan2((-y1 - cy1) / ry, (-x1 - cx1) / rx) - start;
  if (!sweep && delta > 0) delta -= 2 * Math.PI;
  if (sweep && delta < 0) delta += 2 * Math.PI;
  const steps = Math.max(2, Math.ceil(Math.abs(delta) / ((5 * Math.PI) / 180)));
  return Array.from({ length: steps }, (_, k) => {
    const t = start + (delta * (k + 1)) / steps;
    return {
      x: cx + rx * cos * Math.cos(t) - ry * sin * Math.sin(t),
      y: cy + rx * sin * Math.cos(t) + ry * cos * Math.sin(t),
    };
  });
}

/** The part of a line between two distances along it. */
function slicePath(path: Point[], from: number, to: number): Point[] {
  const points = [pointAlong(path, from)];
  let walked = 0;
  for (let i = 1; i < path.length; i++) {
    walked += dist(path[i - 1], path[i]);
    if (walked > from + 1e-6 && walked < to - 1e-6) points.push(path[i]);
  }
  points.push(pointAlong(path, to));
  return points;
}

/** The nearest point on a line, and how far along the line it is. */
function nearestOn(path: Point[], p: Point): { at: Point; along: number; distance: number } {
  let best = { at: path[0], along: 0, distance: dist(path[0], p) };
  let walked = 0;
  for (let i = 1; i < path.length; i++) {
    const [a, b] = [path[i - 1], path[i]];
    const len = dist(a, b);
    const t = len ? Math.max(0, Math.min(1, ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / (len * len))) : 0;
    const at = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    const d = dist(at, p);
    if (d < best.distance) best = { at, along: walked + len * t, distance: d };
    walked += len;
  }
  return best;
}

/** Where two segments cross, as distances along each, or nothing. */
function crossing(a: Point, b: Point, c: Point, d: Point): { t: number; u: number } | null {
  const den = (b.x - a.x) * (d.y - c.y) - (b.y - a.y) * (d.x - c.x);
  if (Math.abs(den) < 1e-9) return null;
  const t = ((c.x - a.x) * (d.y - c.y) - (c.y - a.y) * (d.x - c.x)) / den;
  const u = ((c.x - a.x) * (b.y - a.y) - (c.y - a.y) * (b.x - a.x)) / den;
  return t > 0 && t < 1 && u > 0 && u < 1 ? { t, u } : null;
}

/** Strokes this close are drawn over each other, in mm. */
const OVERLAP = 0.5;
/** An overlap shorter than this is just a crossing, in mm. */
const OVERLAP_MIN = 3;
/** Key points this close are the same point, in mm. */
const SAME_POINT = 2;
/** How much a crossing or a join matters, beside a corner's turn and an end's π. */
const JOIN_SHARPNESS = 2;

/** How far back along its own line a stroke can be said to go over itself, in mm. */
const SELF_GAP = 2;

/**
 * The strokes with the parts already drawn taken out: B's second bump starts
 * by going back along the middle bar, and 9 comes back down its own circle
 * before the stem. Each should carry one row of dots, not two.
 */
function withoutRedrawing(strokes: Point[][]): Point[][] {
  return strokes.flatMap((stroke, k) => {
    const earlier = strokes.slice(0, k);
    const length = pathLength(stroke);
    const step = 0.25;
    const covered: [number, number][] = [];
    for (let s = 0; s <= length; s += step) {
      const p = pointAlong(stroke, s);
      const before = s > SELF_GAP ? [slicePath(stroke, 0, s - SELF_GAP)] : [];
      if (![...earlier, ...before].some(e => nearestOn(e, p).distance < OVERLAP)) continue;
      const last = covered[covered.length - 1];
      if (last && s - last[1] <= step * 1.5) last[1] = s;
      else covered.push([s, s]);
    }
    const cuts = covered.filter(([a, b]) => b - a >= OVERLAP_MIN);
    const pieces: Point[][] = [];
    let from = 0;
    for (const [a, b] of cuts) {
      if (a - from > step) pieces.push(slicePath(stroke, from, a));
      from = b;
    }
    if (length - from > step) pieces.push(slicePath(stroke, from, length));
    return pieces;
  });
}

interface Key {
  at: Point;
  sharpness: number;
  /** Which pieces it is on, and how far along each. */
  on: { piece: number; along: number }[];
}

/**
 * Dots along a letter's strokes, in mm. Like a shape's outline, every end,
 * corner, crossing and join gets a dot, and the stretches between them are
 * shared out evenly, but the strokes are open lines, not one loop.
 */
export function strokeDots(strokes: Point[][], spacing: number, min: number, clear: number): Point[] {
  // A stroke with no length is the dot of an i or j: a circle of its own
  const spots = strokes.filter(s => pathLength(s) < 0.5).map(s => s[0]);
  const pieces = withoutRedrawing(strokes.filter(s => pathLength(s) >= 0.5));
  const lengths = pieces.map(pathLength);

  const raw: Key[] = spots.map(at => ({ at, sharpness: 2 * Math.PI, on: [] }));
  pieces.forEach((piece, p) => {
    const end = lengths[p];
    raw.push({ at: piece[0], sharpness: Math.PI, on: [{ piece: p, along: 0 }] });
    raw.push({ at: piece[piece.length - 1], sharpness: Math.PI, on: [{ piece: p, along: end }] });
    let walked = 0;
    for (let i = 1; i < piece.length - 1; i++) {
      walked += dist(piece[i - 1], piece[i]);
      const turn = turnAt(piece[i - 1], piece[i], piece[i + 1]);
      if (turn > CORNER_TURN) raw.push({ at: piece[i], sharpness: turn, on: [{ piece: p, along: walked }] });
    }
    // An end that lands partway along a piece, this one or another: a join,
    // like E's middle bar, or the tail of 6 meeting its stem
    pieces.forEach((other, q) => {
      for (const [tip, along] of [[piece[0], 0], [piece[piece.length - 1], end]] as const) {
        // A piece's own end is near itself, so look only further along it
        const away = 3 * SAME_POINT;
        const [from, to] = q !== p ? [0, lengths[q]] : along === 0 ? [away, end] : [0, end - away];
        if (to - from <= 0.01) continue;
        const near = nearestOn(slicePath(other, from, to), tip);
        const at = from + near.along;
        if (near.distance < SAME_POINT && at > 0.01 && at < lengths[q] - 0.01) {
          raw.push({ at: near.at, sharpness: JOIN_SHARPNESS, on: [{ piece: q, along: at }] });
        }
      }
    });
  });

  // Crossings, like the middle of X, and where 8 crosses itself
  const starts = pieces.map(piece => piece.map((_, i) => pathLength(piece.slice(0, i + 1))));
  pieces.forEach((a, p) =>
    pieces.forEach((b, q) => {
      if (q < p) return;
      for (let i = 1; i < a.length; i++) {
        for (let j = q === p ? i + 2 : 1; j < b.length; j++) {
          const hit = crossing(a[i - 1], a[i], b[j - 1], b[j]);
          if (!hit) continue;
          const at = { x: a[i - 1].x + (a[i].x - a[i - 1].x) * hit.t, y: a[i - 1].y + (a[i].y - a[i - 1].y) * hit.t };
          raw.push({
            at,
            sharpness: JOIN_SHARPNESS,
            on: [
              { piece: p, along: starts[p][i - 1] + dist(a[i - 1], a[i]) * hit.t },
              { piece: q, along: starts[q][j - 1] + dist(b[j - 1], b[j]) * hit.u },
            ],
          });
        }
      }
    }),
  );

  // Points found more than once - both ends at A's top, the corner of E - become one
  const keys: Key[] = [];
  for (const k of [...raw].sort((a, b) => b.sharpness - a.sharpness)) {
    const same = keys.find(other => dist(other.at, k.at) < SAME_POINT);
    if (same) same.on.push(...k.on);
    else keys.push({ ...k, on: [...k.on] });
  }

  // Where two key points are too close for both, the one that matters more keeps its dot
  const kept = withoutOverlaps(keys, clear).map(i => keys[i]);

  // The stretches between kept key points along each piece. A piece end whose
  // dot was dropped still ends a stretch, just without a dot of its own.
  const runs = pieces.flatMap((piece, p) => {
    // A key point can be on a piece twice: where 8 crosses itself, or where it
    // starts and ends
    const stops = kept.flatMap((key, k) => key.on.filter(o => o.piece === p).map(o => ({ key: k, along: o.along })));
    for (const along of [0, lengths[p]]) {
      if (!stops.some(s => Math.abs(s.along - along) < SAME_POINT)) stops.push({ key: -1, along });
    }
    stops.sort((a, b) => a.along - b.along);
    return stops.slice(1).flatMap((stop, i) => {
      const from = stops[i];
      const length = stop.along - from.along;
      if (length < 0.01) return [];
      return [{ points: slicePath(piece, from.along, stop.along), length, gaps: gapsFor(length, spacing, min), ends: [from.key, stop.key], push: [0, 0] }];
    });
  });

  // Dots evenly spaced along each stretch, after any push away from its ends
  const place = () => [
    ...kept.map((key, k) => ({ at: key.at, run: -1, key: k, ends: [] as number[] })),
    ...runs.flatMap((run, r) => {
      const gap = (run.length - run.push[0] - run.push[1]) / run.gaps;
      return Array.from({ length: run.gaps - 1 }, (_, i) => {
        const along = run.push[0] + gap * (i + 1);
        // Which end it is nearer along the stretch; a dot halfway is near both
        const half = run.length / 2;
        const ends = [along <= half + 1e-6 ? 0 : -1, along >= half - 1e-6 ? 1 : -1].filter(e => e >= 0);
        return { at: pointAlong(run.points, along), run: r, key: -1, ends };
      });
    }),
  ];

  // A dot between key points that touches a dot just round the corner, or the
  // corner's own, means its stretch has a dot too many: take one off and space
  // the rest out again. Down to one dot, it slides away from the corner
  // instead, so the sides of A still get a dot each below the point.
  // Only the corner at the dot's own end of its stretch counts: a bowl that
  // comes back round to its start, as in d, isn't crowded, just folded
  const crowds = (a: { run: number }, end: number, b: { run: number; key: number }) => {
    const corner = runs[a.run].ends[end];
    if (corner < 0) return false;
    return b.key >= 0 ? b.key === corner : b.run !== a.run && runs[b.run].ends.includes(corner);
  };
  const nudge = spacing / 10;
  let dots = place();
  for (;;) {
    const crowded = new Map<number, Set<number>>();
    for (const a of dots) {
      if (a.run < 0 || runs[a.run].gaps <= 1) continue;
      for (const b of dots) {
        if (b === a || dist(a.at, b.at) >= clear) continue;
        for (const end of a.ends.filter(e => crowds(a, e, b))) {
          if (!crowded.has(a.run)) crowded.set(a.run, new Set());
          crowded.get(a.run)!.add(end);
        }
      }
    }
    if (crowded.size === 0) break;
    crowded.forEach((ends, r) => {
      const run = runs[r];
      if (run.gaps > 2) {
        run.gaps--;
        return;
      }
      ends.forEach(e => (run.push[e] += nudge));
      if ((run.length - run.push[0] - run.push[1]) / 2 < min) {
        run.gaps = 1;
        run.push = [0, 0];
      }
    });
    dots = place();
  }

  // Anything still touching is where a letter's strokes run close together,
  // as in the waist of an 8; the key points win
  return withoutOverlaps(
    dots.map(d => ({ at: d.at, sharpness: d.key >= 0 ? 10 + kept[d.key].sharpness : 0 })),
    clear,
  ).map(i => dots[i].at);
}

interface Glyph {
  form: LetterForm;
  strokes: Point[][];
  minX: number;
  maxX: number;
  /** How tall its ink is, in letter units: 100 for a capital, 50 for an x-height letter. */
  inkHeight: number;
}

const GLYPHS = new Map<string, Glyph>();

function glyph(form: LetterForm): Glyph {
  let g = GLYPHS.get(form.char);
  if (!g) {
    const strokes = form.strokes.map(s => flatten(s.d));
    const xs = strokes.flat().map(p => p.x);
    const ys = strokes.flat().map(p => p.y);
    g = { form, strokes, minX: Math.min(...xs), maxX: Math.max(...xs), inkHeight: Math.max(...ys) - Math.min(...ys) };
    GLYPHS.set(form.char, g);
  }
  return g;
}

/**
 * The letters and digits we can draw, in the case typed, with spaces between
 * words, capped at MAX_LETTERS.
 */
export function lettersIn(text: string): string {
  const kept = text
    .split('')
    .map(c => (getLetterForm(c) ? c : c.trim() === '' ? ' ' : ''))
    .join('')
    .replace(/ +/g, ' ')
    .trim();
  let count = 0;
  return kept
    .split('')
    .filter(c => c === ' ' || ++count <= MAX_LETTERS)
    .join('')
    .trim();
}

type Row = (Glyph | null)[];

/** A row without the spaces at its ends. */
function trim(row: Row): Row {
  let [a, b] = [0, row.length];
  while (a < b && row[a] === null) a++;
  while (b > a && row[b - 1] === null) b--;
  return row.slice(a, b);
}

/** A row's letters' width in letter units, and the gaps between them in mm. */
function rowSize(row: Row, spacing: number): { units: number; gaps: number } {
  let units = 0;
  let gaps = 0;
  row.forEach((t, i) => {
    if (t) units += t.maxX - t.minX;
    if (i > 0 && t) gaps += spacing * (row[i - 1] === null ? WORD_GAP : 1);
  });
  return { units, gaps };
}

/** How far above its stem the dot of an i or j should sit, in dot spacings, if there's room. */
const TITTLE_GAP = 1.6;

/**
 * Lift the dot of an i or j clear of its stem, as far as the top of the row
 * allows. At the stroke data's own height it sits one spacing up, just where
 * the next dot down the stem would be, so the i reads as an l.
 */
function liftDots(strokes: Point[][], gap: number, rowTop: number) {
  for (const s of strokes) {
    if (pathLength(s) >= 0.5) continue;
    const stemTop = Math.min(...strokes.filter(o => o !== s).flat().map(p => p.y));
    const y = Math.max(rowTop, Math.min(s[0].y, stemTop - gap));
    s.forEach(p => (p.y = y));
  }
}

/** Space between words, in dot spacings. Letters and rows are one spacing apart. */
const WORD_GAP = 2;
/**
 * Capitals shorter than this many dot spacings stop reading as letters, so
 * the dots shrink. Small letters like o and e make do with fewer.
 */
const MIN_HEIGHT = 3.5;
const MIN_SMALL_HEIGHT = 2.2;

/**
 * Every way of cutting the text into rows, keeping the one with the biggest
 * letters. With `breakWords`, a row may break inside a word, if that makes
 * the letters a good deal bigger. Of rows giving the same size, the most even
 * win.
 */
function layOut(tokens: Row, width: number, height: number, rowUnits: number, spacing: number, room: number, breakWords: boolean) {
  let best = { rows: [tokens], scale: 0, score: -Infinity, widest: Infinity };
  const n = tokens.length;
  const tryCuts = (cuts: number[]) => {
    const bounds = [0, ...cuts, n];
    const rows = bounds.slice(1).map((b, i) => trim(tokens.slice(bounds[i], b)));
    if (rows.some(r => r.length === 0)) return;
    const sizes = rows.map(r => rowSize(r, spacing));
    const across = Math.min(...sizes.map(({ units, gaps }) => (width - room - gaps) / units));
    const down = (height - room - (rows.length - 1) * spacing) / (rows.length * rowUnits);
    const scale = Math.min(across, down);
    const midWord = cuts.filter(c => tokens[c - 1] !== null && tokens[c] !== null).length;
    if (midWord > 0 && !breakWords) return;
    const score = scale * 0.75 ** midWord;
    const widest = Math.max(...sizes.map(({ units, gaps }) => units * scale + gaps));
    const better = score > best.score * (1 + 1e-6) || (score > best.score * (1 - 1e-6) && widest < best.widest - 1e-6);
    if (better) best = { rows, scale, score, widest };
  };
  const choose = (from: number, left: number, cuts: number[]) => {
    if (left === 0) return tryCuts(cuts);
    for (let c = from; c < n; c++) choose(c + 1, left - 1, [...cuts, c]);
  };
  for (let r = 1; r <= Math.min(n, 6); r++) choose(1, r - 1, []);
  return best;
}

/**
 * A word, or a few, as dots along each letter: as big as the puzzle allows,
 * wrapped onto more rows if that makes the letters bigger. When the letters
 * would come out too short for the dots, the dots shrink, down to `smallest`.
 */
export function generateLetterDots(
  gridWidth: number,
  gridHeight: number,
  seed: number,
  text: string,
  diameter: number,
  smallest: number,
): DotMarkerPuzzle {
  const width = gridWidth * CELL_SIZE_MM;
  const height = gridHeight * CELL_SIZE_MM;

  // Nothing typed: a letter, picked by the seed, so rerolling gives a new one
  let chars = lettersIn(text);
  if (!chars) chars = new SeededRandom(seed).pick(LETTER_FORMS).char;
  const tokens: Row = chars.split('').map(c => (c === ' ' ? null : glyph(getLetterForm(c)!)));

  const ys = tokens.flatMap(t => t?.strokes.flat().map(p => p.y) ?? []);
  // Rows fit the ink, so "sam" isn't left room for capitals it doesn't have
  const [top, bottom] = [Math.min(...ys), Math.max(...ys)];
  const rowUnits = bottom - top;

  // Judged on the shortest letter, so "Leo" isn't sized for its L alone
  const shortest = Math.min(...tokens.map(t => t?.inkHeight ?? Infinity));
  const needed = shortest >= 90 ? MIN_HEIGHT : MIN_SMALL_HEIGHT;
  const tryAt = (d: number, breakWords: boolean) =>
    layOut(tokens, width, height, rowUnits, d * SPACING, 2 * (MARGIN + d / 2), breakWords);
  const readable = (d: number, l: { scale: number }) => shortest * l.scale >= needed * d * SPACING;

  // Words kept whole, shrinking the dots as far as Small if need be; then
  // broken words at the chosen size and down; then the best that fits
  const sizes = Array.from({ length: Math.max(1, Math.floor(diameter - smallest) + 1) }, (_, i) => Math.max(smallest, diameter - i));
  let found: { d: number; layout: ReturnType<typeof layOut> } | undefined;
  for (const breakWords of [false, true]) {
    for (const d of sizes) {
      const l = tryAt(d, breakWords);
      if (readable(d, l)) {
        found = { d, layout: l };
        break;
      }
    }
    if (found) break;
  }
  if (!found) found = { d: smallest, layout: tryAt(smallest, true) };
  diameter = found.d;
  const layout = found.layout;
  const spacing = diameter * SPACING;

  const scale = Math.max(0.05, layout.scale);
  const lines: Point[][] = [];
  const dots: Point[] = [];
  const blockHeight = layout.rows.length * rowUnits * scale + (layout.rows.length - 1) * spacing;
  layout.rows.forEach((row, r) => {
    const { units, gaps } = rowSize(row, spacing);
    let x = (width - units * scale - gaps) / 2;
    const oy = (height - blockHeight) / 2 + r * (rowUnits * scale + spacing) - top * scale;
    row.forEach((t, i) => {
      if (!t) return;
      if (i > 0) x += spacing * (row[i - 1] === null ? WORD_GAP : 1);
      const ox = x - t.minX * scale;
      const strokes = t.strokes.map(s => s.map(p => ({ x: ox + p.x * scale, y: oy + p.y * scale })));
      liftDots(strokes, spacing * TITTLE_GAP, oy + top * scale);
      lines.push(...strokes);
      dots.push(...strokeDots(strokes, spacing, diameter * MIN_SPACING, diameter * CLEAR_SPACING));
      x += (t.maxX - t.minX) * scale;
    });
  });

  return { width, height, outline: [], extras: [], lines, dots, radius: diameter / 2 };
}
