import { CELL_SIZE_MM } from '../../../types/puzzle';
import { MAZE_THEMES, type MazeTheme } from '../Maze/themes';

/**
 * In the order children usually manage them: down lines, then across,
 * circles, crosses, then the diagonals and curves of the flowing patterns.
 * Rows follow this order, so a page gets harder as it goes down.
 */
export const PATTERNS = [
  { id: 'down', label: 'Down lines', continuous: false },
  { id: 'across', label: 'Across lines', continuous: true },
  { id: 'circles', label: 'Circles', continuous: false },
  { id: 'crosses', label: 'Crosses', continuous: false },
  { id: 'waves', label: 'Waves', continuous: true },
  { id: 'arches', label: 'Arches', continuous: true },
  { id: 'zigzags', label: 'Zigzags', continuous: true },
  { id: 'loops', label: 'Loops', continuous: true },
] as const;

export type PatternId = typeof PATTERNS[number]['id'];

/** The starting set, pitched at about five. */
export const DEFAULT_PATTERNS: PatternId[] = ['circles', 'crosses', 'waves', 'arches', 'zigzags'];

/**
 * A road is one continuous line with no crossings, so it takes only the
 * flowing patterns, less loops (whose crossings would look like junctions).
 */
export const ROAD_PATTERNS: ReadonlySet<PatternId> = new Set(['across', 'waves', 'arches', 'zigzags']);

export type LineStyle = 'wide' | 'narrow' | 'dotted';
export type PatternSize = 'small' | 'medium' | 'large';

/** Pattern height in mm, from the top of a wave to the bottom. */
const PATTERN_HEIGHT: Record<PatternSize, number> = { small: 8, medium: 12, large: 18 };

/** Road width between the two edges, in mm. */
export const ROAD_WIDTH: Record<'wide' | 'narrow', number> = { wide: 15, narrow: 9 };
export const ROAD_EDGE = 0.9;

/** All layout in mm. The component draws with the same numbers. */
export const LAYOUT = {
  padding: 4,
  /** Least space between rows. */
  rowGap: 6,
  /** Room for the dots' and strokes' thickness above and below a dotted row. */
  strokeAllowance: 2,
  /** Between the solid example and the dotted part. */
  exampleGap: 5,
  /** Start emoji size, as a share of the road's full width. */
  emojiScale: 1.05,
  minEmoji: 10,
  /** Between an emoji and its end of the road. */
  emojiGap: 0.5,
};

export type Point = [number, number];

export interface DottedRow {
  kind: 'dotted';
  pattern: PatternId;
  /** Centre line of the row, mm from the top of the puzzle. */
  y: number;
  /** Each a separate stroke (a mark, or one run of a flowing pattern). */
  example: Point[][];
  trace: Point[][];
  /** Where to put the pencil down on the trace part: one per stroke. */
  starts: Point[];
}

export interface RoadRow {
  kind: 'road';
  pattern: PatternId;
  y: number;
  path: Point[];
  theme: MazeTheme;
  emojiSize: number;
  /** Centres of the two emoji. */
  from: Point;
  to: Point;
}

export type Row = DottedRow | RoadRow;

export interface PreWritingPuzzle {
  width: number;
  height: number;
  rows: Row[];
  roadWidth: number;
  /** Centre to centre, in mm. Closer on small patterns so tight curves still read. */
  dotSpacing: number;
}

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

/** Sample spacing along a curve, in mm. Fine enough to print smooth. */
const STEP = 0.4;

/** One repeat's width for a pattern of height h, in mm. */
function periodOf(pattern: PatternId, h: number): number {
  switch (pattern) {
    case 'down': return h * 0.55;
    case 'across': return h;
    case 'circles': return h * 1.35;
    case 'crosses': return h * 1.4;
    case 'waves': return h * 1.6;
    case 'arches': return h * 1.1;
    case 'zigzags': return h * 0.9;
    case 'loops': return h * 1.2; // any shorter and each loop overlaps the next
  }
}

/**
 * A flowing pattern's height above the centre line at x, for x in 0..period.
 * Up is negative, as in SVG. Each starts and ends a period at the same height.
 */
function flowY(pattern: PatternId, x: number, period: number, h: number): number {
  const t = x / period;
  const half = h / 2;
  switch (pattern) {
    case 'across':
      return 0;
    case 'waves':
      return -half * Math.sin(2 * Math.PI * t);
    case 'arches':
      // Round tops, sharp feet on the line: ∩∩∩
      return half - h * Math.abs(Math.sin(Math.PI * t));
    case 'zigzags': {
      // Triangle wave from the centre: up, down, back to the centre
      const u = (t + 0.25) % 1;
      return -half * (u < 0.5 ? 4 * u - 1 : 3 - 4 * u);
    }
    default:
      return 0;
  }
}

/** `count` repeats of a flowing pattern from x0, as one stroke. */
function flowStroke(pattern: PatternId, x0: number, count: number, period: number, h: number): Point[] {
  if (pattern === 'loops') return loopStroke(x0, count, period, h);
  const length = count * period;
  const steps = Math.max(2, Math.ceil(length / STEP));
  const points: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = (length * i) / steps;
    points.push([x0 + x, flowY(pattern, x % period, period, h)]);
  }
  return points;
}

/**
 * Joined loops like a row of joined cursive "l"s: along the bottom, up and
 * round anticlockwise at the top, back down. A prolate cycloid.
 */
function loopStroke(x0: number, count: number, period: number, h: number): Point[] {
  const b = h / 2;
  const a = period / (2 * Math.PI);
  const points: Point[] = [];
  const end = Math.PI + 2 * Math.PI * count;
  const steps = Math.ceil(count * 80);
  for (let i = 0; i <= steps; i++) {
    const t = Math.PI + ((end - Math.PI) * i) / steps;
    points.push([x0 + a * (t - Math.PI) - b * Math.sin(t), -b * Math.cos(t)]);
  }
  return points;
}

/** One separate mark, drawn the way it is written. */
function markStrokes(pattern: PatternId, cx: number, h: number): Point[][] {
  const half = h / 2;
  switch (pattern) {
    case 'down':
      return [[[cx, -half], [cx, half]]];
    case 'crosses':
      return [[[cx, -half], [cx, half]], [[cx - half, 0], [cx + half, 0]]];
    case 'circles': {
      // From the top, anticlockwise, as letters like c and o are taught
      const steps = 72;
      const points: Point[] = [];
      for (let i = 0; i <= steps; i++) {
        const angle = -Math.PI / 2 - (2 * Math.PI * i) / steps;
        points.push([cx + half * Math.cos(angle), half * Math.sin(angle)]);
      }
      return [points];
    }
    default:
      return [];
  }
}

function dottedRow(pattern: PatternId, y: number, width: number, h: number, finish: 'trace' | 'continue'): DottedRow {
  const left = LAYOUT.padding + LAYOUT.strokeAllowance;
  const period = periodOf(pattern, h);
  const continuous = PATTERNS.find(p => p.id === pattern)!.continuous;

  // A mark is as wide as the pattern is tall, the rest is the space after it
  const markWidth = pattern === 'down' ? 0 : h;
  const exampleWidth = continuous ? period : markWidth;
  const afterExample = left + exampleWidth + LAYOUT.exampleGap;
  const room = width - left - afterExample;
  // Whole repeats only, so every run ends where it started. A mark also needs
  // its own width at the end, past its last spacing.
  const fits = Math.max(1, Math.floor((room - (continuous ? 0 : markWidth)) / period) + (continuous ? 0 : 1));
  const traceCount = finish === 'continue' ? Math.max(1, Math.ceil(fits * 0.5)) : fits;

  let example: Point[][];
  let trace: Point[][];
  let starts: Point[];
  if (continuous) {
    example = [flowStroke(pattern, left, 1, period, h)];
    trace = [flowStroke(pattern, afterExample, traceCount, period, h)];
    starts = [trace[0][0]];
  } else {
    example = markStrokes(pattern, left + markWidth / 2, h);
    trace = [];
    starts = [];
    for (let i = 0; i < traceCount; i++) {
      const strokes = markStrokes(pattern, afterExample + markWidth / 2 + i * period, h);
      trace.push(...strokes);
      starts.push(strokes[0][0]);
    }
  }
  return { kind: 'dotted', pattern, y, example, trace, starts };
}

function roadRow(
  pattern: PatternId,
  y: number,
  width: number,
  h: number,
  roadWidth: number,
  theme: MazeTheme,
): RoadRow {
  const full = roadWidth + 2 * ROAD_EDGE;
  const emojiSize = Math.max(LAYOUT.minEmoji, full * LAYOUT.emojiScale);
  const x0 = LAYOUT.padding + emojiSize + LAYOUT.emojiGap;
  const x1 = width - LAYOUT.padding - emojiSize - LAYOUT.emojiGap;
  const length = Math.max(1, x1 - x0);
  // A bend tighter than half the road's width pinches its inside edge to a
  // point. Zigzags and the feet of arches are meant to be sharp; waves and
  // the tops of arches are not. So pick a period long enough for a gentle
  // curve, then lower the pattern a little if rounding left it too tight.
  // The tightest curve is (h/2)(2π/P)² at a wave's peak, h(π/P)² at an arch's top.
  const room = full / 2 / 0.9;
  const smooth =
    pattern === 'waves' ? 2 * Math.PI * Math.sqrt((h / 2) * room)
      : pattern === 'arches' ? Math.PI * Math.sqrt(h * room)
        : 0;
  const wanted = Math.max(periodOf(pattern, h), full * 2.2, smooth);
  const count = Math.max(1, Math.round(length / wanted));
  const period = length / count;
  const maxH =
    pattern === 'waves' ? (2 * (period / (2 * Math.PI)) ** 2) / room
      : pattern === 'arches' ? (period / Math.PI) ** 2 / room
        : h;
  const path = flowStroke(pattern, x0, count, period, Math.min(h, maxH));
  const first = path[0];
  const last = path[path.length - 1];
  return {
    kind: 'road',
    pattern,
    y,
    path,
    theme,
    emojiSize,
    from: [LAYOUT.padding + emojiSize / 2, first[1]],
    to: [width - LAYOUT.padding - emojiSize / 2, last[1]],
  };
}

/**
 * Which pattern goes on each row: the chosen ones in teaching order, cycled.
 * When there are more patterns than rows, the seed picks which to leave out.
 */
function choosePatterns(chosen: PatternId[], rows: number, rng: SeededRandom): PatternId[] {
  let ordered = PATTERNS.map(p => p.id).filter(id => chosen.includes(id));
  if (ordered.length > rows) {
    const keep = new Set<PatternId>();
    const pool = [...ordered];
    while (keep.size < rows) keep.add(pool.splice(rng.nextInt(pool.length), 1)[0]);
    ordered = ordered.filter(id => keep.has(id));
  }
  return Array.from({ length: rows }, (_, i) => ordered[i % ordered.length]);
}

export function generatePreWriting(
  gridWidth: number,
  gridHeight: number,
  seed: number,
  line: LineStyle,
  patterns: PatternId[],
  size: PatternSize,
  finish: 'trace' | 'continue',
): PreWritingPuzzle {
  const rng = new SeededRandom(seed);
  const width = gridWidth * CELL_SIZE_MM;
  const height = gridHeight * CELL_SIZE_MM;
  const isRoad = line !== 'dotted';
  const roadWidth = isRoad ? ROAD_WIDTH[line] : 0;

  let usable = patterns.filter(p => !isRoad || ROAD_PATTERNS.has(p));
  if (usable.length === 0) usable = [isRoad ? 'waves' : 'across'];

  // Thickness of a row besides the pattern itself
  const extra = isRoad
    ? Math.max(roadWidth + 2 * ROAD_EDGE, LAYOUT.minEmoji)
    : LAYOUT.strokeAllowance * 2;
  const inner = height - 2 * LAYOUT.padding;
  // Shrink the pattern if not even one row fits
  const h = Math.max(4, Math.min(PATTERN_HEIGHT[size], inner - extra));
  const rowHeight = h + extra;
  const rowCount = Math.max(1, Math.floor((inner + LAYOUT.rowGap) / (rowHeight + LAYOUT.rowGap)));
  // Share the spare height out between and around the rows
  const spare = inner - rowCount * rowHeight;
  const gap = spare / (rowCount + 1);

  const rowPatterns = choosePatterns(usable, rowCount, rng);
  const themes = [...MAZE_THEMES];

  const rows = rowPatterns.map((pattern, i): Row => {
    const y = LAYOUT.padding + gap + i * (rowHeight + gap) + rowHeight / 2;
    if (isRoad) {
      const theme = themes.splice(rng.nextInt(themes.length), 1)[0];
      return roadRow(pattern, y, width, h, roadWidth, theme);
    }
    return dottedRow(pattern, y, width, h, finish);
  });

  const dotSpacing = Math.min(2.4, Math.max(1.6, h * 0.2));
  return { width, height, rows, roadWidth, dotSpacing };
}

/**
 * A pattern drawn small, for the config bar's buttons: two repeats, or two
 * marks, centred in a box `width` by `height` (y from -height/2 to height/2).
 */
export function previewStrokes(pattern: PatternId, width: number, height: number): Point[][] {
  const h = height * 0.8;
  const continuous = PATTERNS.find(p => p.id === pattern)!.continuous;
  if (continuous) {
    const period = Math.min(periodOf(pattern, h), width * 0.45);
    const stroke = flowStroke(pattern, 0, 2, period, h);
    const minX = Math.min(...stroke.map(p => p[0]));
    const maxX = Math.max(...stroke.map(p => p[0]));
    const shift = (width - (maxX - minX)) / 2 - minX;
    return [stroke.map(([x, y]) => [x + shift, y] as Point)];
  }
  const gap = Math.min(periodOf(pattern, h), width * 0.5);
  return [
    ...markStrokes(pattern, width / 2 - gap / 2, h),
    ...markStrokes(pattern, width / 2 + gap / 2, h),
  ];
}
