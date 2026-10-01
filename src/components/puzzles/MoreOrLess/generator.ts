import { ANIMAL_EMOJI, FRUIT_EMOJI, VEHICLE_EMOJI } from '../Counting/generator';
import { CELL_SIZE_MM } from '../../../types/puzzle';

// More or Less puzzle data structures

export type Relation = '>' | '<' | '=';

/**
 * How one side's emoji are arranged. All of them spread across the whole side,
 * so a bigger group can't be spotted by how much room it takes up - it has to
 * be counted. `mixed` picks per side, so the two halves of a row rarely match.
 */
export type Layout = 'scatter' | 'rows' | 'clusters';
export type LayoutMode = Layout | 'mixed';

/** An emoji's centre, in mm from the top-left of its side. */
export interface Position {
  x: number;
  y: number;
}

export interface Side {
  emoji: string;
  count: number;
  layout: Layout;
  positions: Position[];
}

export interface MoreOrLessProblem {
  left: Side;
  right: Side;
  relation: Relation;
}

export interface MoreOrLessPuzzle {
  problems: MoreOrLessProblem[];
  /** Size of each side's box, in mm. */
  sideWidth: number;
  sideHeight: number;
}

/*
 * Layout in mm, matching MoreOrLess.module.css. Change them together: the
 * size of each side's box comes from these, and the count limit from that.
 */
const CONTAINER_PAD_MM = 2;
const STACK_GAP_MM = 2;
export const KEY_MM = 10;
const ROW_PAD_X_MM = 3;
const ROW_PAD_Y_MM = 2;
const ROW_BORDER_MM = 0.3;
/** The answer box plus the gap either side of it. */
const MIDDLE_MM = 10 + 2 * 4;

/** Each problem takes two grid rows; the key takes one more. */
const ROWS_PER_PROBLEM = 2;

/** Emoji glyph size, and how close two centres may sit without touching. */
export const EMOJI_MM = 6.5;
const MIN_SPACING_MM = 7.5;
/** Lattice slot for scatter's fallback and for working out the count limit. */
const SLOT_MM = 8.5;
/**
 * Share of the lattice the biggest group may fill. Any denser and every layout
 * turns into a neat grid, which is easy to compare without counting.
 */
const MAX_FILL = 0.6;

const EQUAL_CHANCE = 1 / 4;
/**
 * Unequal sides differ by at most this much. Wider gaps can be judged at a
 * glance, which is what the layouts are there to stop.
 */
const MAX_DIFF = 4;

/** Tries at drawing a pair not already on the page before picking from what's left. */
const MAX_DRAWS = 20;

const THEMES: string[][] = [
  ANIMAL_EMOJI,
  VEHICLE_EMOJI,
  FRUIT_EMOJI,
  ['🐝', '🐞', '🐜', '🐛', '🐌', '🕷️'],
  ['🐙', '🦀', '🐠', '🐳', '🦈', '🐬', '🦑'],
];

// Seeded random number generator for reproducible puzzles
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

  nextIntRange(min: number, max: number): number {
    return min + this.nextInt(max - min + 1);
  }

  nextFloat(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

export function problemCountForHeight(gridHeight: number): number {
  return Math.max(1, Math.floor((gridHeight - 1) / ROWS_PER_PROBLEM));
}

function sideWidthMm(gridWidth: number): number {
  const inner = gridWidth * CELL_SIZE_MM - 2 * CONTAINER_PAD_MM - 2 * ROW_PAD_X_MM - 2 * ROW_BORDER_MM;
  return (inner - MIDDLE_MM) / 2;
}

function sideHeightMm(gridHeight: number, problemCount: number): number {
  const stack = gridHeight * CELL_SIZE_MM - 2 * CONTAINER_PAD_MM - KEY_MM - problemCount * STACK_GAP_MM;
  return stack / problemCount - 2 * ROW_PAD_Y_MM - 2 * ROW_BORDER_MM;
}

/**
 * Most emoji one side can hold at this width. Worked out at the nominal two
 * grid rows per problem, so a taller puzzle gets roomier rows rather than
 * bigger numbers: 9 at the default width of 6, up to 16 at full width.
 */
export function maxCountForWidth(gridWidth: number): number {
  const nominalHeight = ROWS_PER_PROBLEM * CELL_SIZE_MM - STACK_GAP_MM - 2 * ROW_PAD_Y_MM - 2 * ROW_BORDER_MM;
  const slots = Math.floor(sideWidthMm(gridWidth) / SLOT_MM) * Math.floor(nominalHeight / SLOT_MM);
  return Math.max(3, Math.floor(slots * MAX_FILL));
}

// --- Pairs ---

interface Pair {
  left: number;
  right: number;
}

const pairKey = ({ left, right }: Pair) => `${left}-${right}`;

function relationOf({ left, right }: Pair): Relation {
  if (left > right) return '>';
  if (left < right) return '<';
  return '=';
}

/** `atMax` forces the bigger side (both, if equal) to the limit. */
function drawPair(rng: SeededRandom, equal: boolean, maxCount: number, atMax: boolean): Pair {
  if (equal) {
    const n = atMax ? maxCount : rng.nextIntRange(1, maxCount);
    return { left: n, right: n };
  }
  const diff = rng.nextIntRange(1, Math.min(MAX_DIFF, maxCount - 1));
  const big = atMax ? maxCount : rng.nextIntRange(1 + diff, maxCount);
  const small = big - diff;
  return rng.next() < 0.5 ? { left: big, right: small } : { left: small, right: big };
}

/** A pair not yet on the page, of the wanted kind if any are left. */
function pickUnused(rng: SeededRandom, used: Set<string>, equal: boolean, maxCount: number): Pair | undefined {
  const unused: Pair[] = [];
  for (let left = 1; left <= maxCount; left++) {
    for (let right = 1; right <= maxCount; right++) {
      const pair = { left, right };
      if (!used.has(pairKey(pair)) && Math.abs(left - right) <= MAX_DIFF) unused.push(pair);
    }
  }
  const shuffled = rng.shuffle(unused);
  return shuffled.find(pair => (relationOf(pair) === '=') === equal) ?? shuffled[0];
}

// --- Emoji ---

/**
 * Two different emoji from one theme per row - plane against train, bird
 * against turtle. Rows take turns through the themes and avoid emoji already
 * on the page until a theme runs dry.
 */
function pickEmoji(rng: SeededRandom, problemCount: number): Array<[string, string]> {
  const themes = rng.shuffle(THEMES);
  const used = new Set<string>();
  return Array.from({ length: problemCount }, (_, i) => {
    const theme = themes[i % themes.length];
    const fresh = rng.shuffle(theme.filter(e => !used.has(e)));
    const pool = fresh.length >= 2 ? fresh : rng.shuffle(theme);
    used.add(pool[0]);
    used.add(pool[1]);
    return [pool[0], pool[1]];
  });
}

// --- Layouts ---

const fits = (p: Position, placed: Position[]) =>
  placed.every(q => Math.hypot(p.x - q.x, p.y - q.y) >= MIN_SPACING_MM);

/** Even grid of slots with each emoji nudged within its slot. Always fits. */
function latticeLayout(rng: SeededRandom, count: number, width: number, height: number): Position[] {
  const cols = Math.max(1, Math.floor(width / SLOT_MM));
  const rows = Math.max(1, Math.floor(height / SLOT_MM));
  const cellW = width / cols;
  const cellH = height / rows;
  const slackX = Math.max(0, (cellW - MIN_SPACING_MM) / 2);
  const slackY = Math.max(0, (cellH - MIN_SPACING_MM) / 2);
  const slots = rng.shuffle(Array.from({ length: cols * rows }, (_, i) => i)).slice(0, count);
  return slots.map(slot => ({
    x: (slot % cols + 0.5) * cellW + rng.nextFloat(-slackX, slackX),
    y: (Math.floor(slot / cols) + 0.5) * cellH + rng.nextFloat(-slackY, slackY),
  }));
}

/**
 * Dart throwing: each emoji tries random spots from `propose` until one is
 * clear of the others. Starts over a few times if it paints itself into a
 * corner, then gives up so the caller can fall back to the lattice.
 */
function throwDarts(
  count: number,
  propose: (index: number, attempt: number) => Position,
  width: number,
  height: number
): Position[] | undefined {
  const margin = EMOJI_MM / 2;
  for (let restart = 0; restart < 6; restart++) {
    const placed: Position[] = [];
    for (let i = 0; i < count; i++) {
      for (let attempt = 0; attempt < 150; attempt++) {
        const p = propose(i, attempt);
        const inside = p.x >= margin && p.x <= width - margin && p.y >= margin && p.y <= height - margin;
        if (inside && fits(p, placed)) {
          placed.push(p);
          break;
        }
      }
      if (placed.length <= i) break;
    }
    if (placed.length === count) return placed;
  }
  return undefined;
}

function scatterLayout(rng: SeededRandom, count: number, width: number, height: number): Position[] {
  const margin = EMOJI_MM / 2;
  return throwDarts(
    count,
    () => ({ x: rng.nextFloat(margin, width - margin), y: rng.nextFloat(margin, height - margin) }),
    width,
    height
  ) ?? latticeLayout(rng, count, width, height);
}

/**
 * Two lines with random gaps, so a line that looks full might hold fewer than
 * one that looks sparse. Each line spans the side's width.
 */
function rowsLayout(rng: SeededRandom, count: number, width: number, height: number): Position[] {
  const slotW = MIN_SPACING_MM;
  const perLine = Math.floor(width / slotW);
  if (count > 2 * perLine || height < 2 * MIN_SPACING_MM) return scatterLayout(rng, count, width, height);

  const minTop = Math.max(count > 1 ? 1 : 0, count - perLine);
  const maxTop = Math.min(perLine, count - (count > 1 ? 1 : 0));
  const top = rng.nextIntRange(minTop, maxTop);
  const lineY = [height * 0.28, height * 0.72];
  const wobbleY = Math.min(1.5, (lineY[1] - lineY[0] - MIN_SPACING_MM) / 2);
  const slack = (width / perLine - slotW) / 2;

  return [top, count - top].flatMap((n, line) =>
    rng.shuffle(Array.from({ length: perLine }, (_, i) => i)).slice(0, n).map(slot => ({
      x: (slot + 0.5) * (width / perLine) + rng.nextFloat(-slack, slack),
      y: lineY[line] + rng.nextFloat(-wobbleY, wobbleY),
    }))
  );
}

/**
 * A few tight huddles spread over the side. Huddle sizes are uneven, so the
 * number of huddles says nothing about the total.
 */
function clustersLayout(rng: SeededRandom, count: number, width: number, height: number): Position[] {
  const clusterCount = Math.min(count, rng.nextIntRange(2, count >= 8 ? 4 : 3));
  const margin = EMOJI_MM / 2;
  const centres = throwDarts(
    clusterCount,
    () => ({ x: rng.nextFloat(margin, width - margin), y: rng.nextFloat(margin, height - margin) }),
    width,
    height
  );
  if (!centres) return scatterLayout(rng, count, width, height);

  // Every huddle gets at least one, the rest land at random
  const owner = [
    ...centres.map((_, c) => c),
    ...Array.from({ length: count - clusterCount }, () => rng.nextInt(clusterCount)),
  ];
  return throwDarts(
    count,
    (i, attempt) => {
      if (i < clusterCount) return centres[i];
      // Search outward from the huddle's centre as tries run out
      const radius = MIN_SPACING_MM * (1 + attempt / 40);
      const angle = rng.nextFloat(0, 2 * Math.PI);
      const r = rng.nextFloat(MIN_SPACING_MM, radius);
      const c = centres[owner[i]];
      return { x: c.x + r * Math.cos(angle), y: c.y + r * Math.sin(angle) };
    },
    width,
    height
  ) ?? scatterLayout(rng, count, width, height);
}

const LAYOUTS: Layout[] = ['scatter', 'rows', 'clusters'];

function placeSide(rng: SeededRandom, emoji: string, count: number, mode: LayoutMode, width: number, height: number): Side {
  const layout = mode === 'mixed' ? LAYOUTS[rng.nextInt(LAYOUTS.length)] : mode;
  const positions =
    layout === 'rows' ? rowsLayout(rng, count, width, height)
    : layout === 'clusters' ? clustersLayout(rng, count, width, height)
    : scatterLayout(rng, count, width, height);
  return { emoji, count, layout, positions };
}

/**
 * One problem per two grid rows, no two pairs alike. One random row has a
 * side at the most the width allows, so a wider puzzle reliably asks for more.
 * With `workedExample`, the first row is kept unequal since it's there to show
 * which way the symbol points.
 */
export function generateMoreOrLess(
  gridWidth: number,
  gridHeight: number,
  seed: number,
  layoutMode: LayoutMode,
  workedExample: boolean
): MoreOrLessPuzzle {
  const rng = new SeededRandom(seed);
  const problemCount = problemCountForHeight(gridHeight);
  const maxCount = maxCountForWidth(gridWidth);
  const sideWidth = sideWidthMm(gridWidth);
  const sideHeight = sideHeightMm(gridHeight, problemCount);
  const emoji = pickEmoji(rng, problemCount);

  // The full-size row is drawn first so it can't find its pairs already taken
  const fullRow = rng.nextInt(problemCount);
  const rowOrder = [fullRow, ...Array.from({ length: problemCount }, (_, i) => i).filter(i => i !== fullRow)];

  const used = new Set<string>();
  const pairs: Pair[] = [];
  for (const row of rowOrder) {
    const isExample = workedExample && row === 0;
    const equal = !isExample && rng.next() < EQUAL_CHANCE;

    let pair: Pair | undefined;
    for (let i = 0; i < MAX_DRAWS && !pair; i++) {
      const drawn = drawPair(rng, equal, maxCount, row === fullRow);
      if (!used.has(pairKey(drawn))) pair = drawn;
    }
    pair ??= pickUnused(rng, used, equal, maxCount) ?? drawPair(rng, equal, maxCount, false);

    used.add(pairKey(pair));
    pairs[row] = pair;
  }

  const problems = pairs.map((pair, i) => ({
    left: placeSide(rng, emoji[i][0], pair.left, layoutMode, sideWidth, sideHeight),
    right: placeSide(rng, emoji[i][1], pair.right, layoutMode, sideWidth, sideHeight),
    relation: relationOf(pair),
  }));

  return { problems, sideWidth, sideHeight };
}
