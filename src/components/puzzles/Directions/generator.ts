import { CELL_SIZE_MM } from '../../../types/puzzle';
import { traceCoast } from './coast';
import { buildIsland, stampIsland, type Stamp } from './island';

// Directions puzzle data structures

export type Direction = 'up' | 'down' | 'left' | 'right';

/**
 * - follow: read the route, mark where it ends.
 * - write: start and goal are shown, the child writes the route.
 * - fix: the route is shown with one mistake for the child to find.
 */
export type DirectionsMode = 'follow' | 'write' | 'fix';

/**
 * How a route is written down:
 * - arrows: one arrow per square, `→ → ↓`
 * - counts: one token per straight run, `2 →`
 * - words:  one token per straight run, `2 right`
 */
export type Notation = 'arrows' | 'counts' | 'words';

export type RouteLength = 'short' | 'medium' | 'long';

/** One straight run of the route. Arrows notation has every count at 1. */
export interface Token {
  dir: Direction;
  count: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface DirectionsPuzzle {
  cols: number;
  rows: number;
  /** Map square size, in mm. */
  cellMm: number;
  /** Squares that can't be walked on, keyed `x,y`: sea, terrain, landmarks. */
  blocked: Set<string>;
  /** Everything drawn on the map, in mm. */
  stamps: Stamp[];
  /** Coastline loops and the echo lines out to sea, as SVG path data in mm. */
  coast: string[];
  echoes: string[];
  start: Point;
  goal: Point;
  /** The route as printed. In fix mode it holds the mistake. */
  tokens: Token[];
  /** Fix mode: which token is wrong, and what it should be. */
  mistake?: { index: number; correct: Token };
  /** Write mode: how many answer boxes to draw. */
  boxCount: number;
  /** Lines of tokens the strip under the map is sized for. */
  stripLines: number;
}

/*
 * Layout in mm, matching Directions.module.css. Change them together: the map's
 * size and how many tokens fit under it both come from these.
 */
const CONTAINER_PAD_MM = 2;
export const PROMPT_MM = 7;
const STACK_GAP_MM = 2;
export const TOKEN_MM = 10;
export const TOKEN_GAP_MM = 2;
/** Map squares stay within this range - big enough to count and draw in. */
const MIN_CELL_MM = 12;
const MAX_CELL_MM = 17;

export const TOKEN_WIDTH_MM: Record<Notation, number> = {
  arrows: 9,
  counts: 15,
  words: 22,
};

export const stripHeightMm = (lines: number) => lines * TOKEN_MM + (lines - 1) * TOKEN_GAP_MM;

const MOVES_FOR_LENGTH: Record<RouteLength, number> = {
  short: 2,
  medium: 3,
  long: 5,
};

/** Longest straight run, in squares. Kept low so the counts stay countable. */
const MAX_RUN = 3;
const ROUTE_TRIES = 200;

export const DIRECTION_ARROWS: Record<Direction, string> = {
  up: '⬆️',
  down: '⬇️',
  left: '⬅️',
  right: '➡️',
};

const STEP: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const ALL_DIRECTIONS: Direction[] = ['up', 'right', 'down', 'left'];

const isHorizontal = (dir: Direction) => dir === 'left' || dir === 'right';

const OPPOSITE: Record<Direction, Direction> = { up: 'down', down: 'up', left: 'right', right: 'left' };

// Seeded random number generator for reproducible puzzles
export class SeededRandom {
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

  pick<T>(arr: T[]): T {
    return arr[this.nextInt(arr.length)];
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

const key = (p: Point) => `${p.x},${p.y}`;

// --- Layout ---

function innerWidthMm(gridWidth: number): number {
  return gridWidth * CELL_SIZE_MM - 2 * CONTAINER_PAD_MM;
}

function mapHeightMm(gridHeight: number, stripLines: number): number {
  return gridHeight * CELL_SIZE_MM - 2 * CONTAINER_PAD_MM - PROMPT_MM - stripHeightMm(stripLines) - 2 * STACK_GAP_MM;
}

/** Room for the map's outer border, which sits outside its squares. */
const MAP_BORDER_MM = 1;

/**
 * The squares' count and size that cover the most of the space, square sizes
 * kept within range. Leftover space is unavoidable in one direction, since the
 * squares stay square, but this keeps it to a sliver.
 */
function mapSize(gridWidth: number, gridHeight: number, stripLines: number) {
  const width = innerWidthMm(gridWidth) - MAP_BORDER_MM;
  const height = mapHeightMm(gridHeight, stripLines) - MAP_BORDER_MM;
  let best = { cols: 3, rows: 3, cellMm: Math.min(width, height) / 3 };
  let bestArea = 0;
  for (let cols = 3; cols * MIN_CELL_MM <= width; cols++) {
    for (let rows = 3; rows * MIN_CELL_MM <= height; rows++) {
      const cellMm = Math.min(width / cols, height / rows, MAX_CELL_MM);
      const area = cols * rows * cellMm * cellMm;
      if (cellMm >= MIN_CELL_MM && area > bestArea + 1) {
        best = { cols, rows, cellMm };
        bestArea = area;
      }
    }
  }
  return best;
}

/** How many tokens fit in the strip under the map. */
function maxTokens(gridWidth: number, notation: Notation, stripLines: number): number {
  const perLine = Math.floor((innerWidthMm(gridWidth) + TOKEN_GAP_MM) / (TOKEN_WIDTH_MM[notation] + TOKEN_GAP_MM));
  return Math.max(1, perLine) * stripLines;
}

// --- Routes ---

/** Splits runs into single steps for arrows notation. */
function toNotation(moves: Token[], notation: Notation): Token[] {
  if (notation !== 'arrows') return moves;
  return moves.flatMap(m => Array.from({ length: m.count }, () => ({ dir: m.dir, count: 1 })));
}

const NO_BLOCKS = new Set<string>();

/**
 * Walks the tokens from `start`. Returns the squares visited after the start,
 * or undefined if the walk leaves the map or hits a blocked square.
 */
function walk(
  tokens: Token[],
  start: Point,
  cols: number,
  rows: number,
  blocked: Set<string>
): Point[] | undefined {
  const visited: Point[] = [];
  let p = start;
  for (const { dir, count } of tokens) {
    for (let i = 0; i < count; i++) {
      p = { x: p.x + STEP[dir].x, y: p.y + STEP[dir].y };
      if (p.x < 0 || p.y < 0 || p.x >= cols || p.y >= rows || blocked.has(key(p))) return undefined;
      visited.push(p);
    }
  }
  return visited;
}

/**
 * A random route of `moveCount` straight runs, each turning a corner from the
 * last. It never crosses itself, so following it can't double back to a
 * square the child has already passed.
 */
function randomRoute(rng: SeededRandom, cols: number, rows: number, moveCount: number) {
  // The ship moors in a square on the edge, and the first run heads inland
  const inland: Direction = rng.pick(ALL_DIRECTIONS);
  const along = (n: number) => rng.nextInt(n);
  const start =
    inland === 'down' ? { x: along(cols), y: 0 }
    : inland === 'up' ? { x: along(cols), y: rows - 1 }
    : inland === 'right' ? { x: 0, y: along(rows) }
    : { x: cols - 1, y: along(rows) };
  const seen = new Set([key(start)]);
  const moves: Token[] = [];
  let p = start;
  let horizontal = isHorizontal(inland);

  for (let m = 0; m < moveCount; m++) {
    const options: Token[] = [];
    const dirs = m === 0 ? [inland] : ALL_DIRECTIONS.filter(d => isHorizontal(d) === horizontal);
    for (const dir of dirs) {
      for (let count = 1; count <= MAX_RUN; count++) {
        const path = walk([{ dir, count }], p, cols, rows, NO_BLOCKS);
        if (!path || path.some(q => seen.has(key(q)))) break;
        // Runs of one are half as likely: they leave nothing to count
        for (let weight = Math.min(count, 2); weight > 0; weight--) options.push({ dir, count });
      }
    }
    if (options.length === 0) return undefined;
    const move = rng.pick(options);
    for (const q of walk([move], p, cols, rows, NO_BLOCKS)!) {
      seen.add(key(q));
      p = q;
    }
    moves.push(move);
    horizontal = !horizontal;
  }
  return { start, goal: p, moves, route: seen };
}

/**
 * Where the usual slips leave a child: one run turned the wrong way, or
 * counted one too many or too few. Follow mode puts a landmark on each, so a
 * wrong answer lands on something the parent can name. Only squares off the
 * route count - the route itself has to stay clear.
 */
function mistakeEnds(moves: Token[], start: Point, cols: number, rows: number, route: Set<string>): Point[] {
  const variants = moves.flatMap((m, i) => {
    const swap = (t: Token) => moves.map((s, j) => (j === i ? t : s));
    return [
      swap({ dir: OPPOSITE[m.dir], count: m.count }),
      swap({ dir: m.dir, count: m.count + 1 }),
      ...(m.count > 1 ? [swap({ dir: m.dir, count: m.count - 1 })] : []),
    ];
  });
  const ends = new Map<string, Point>();
  for (const variant of variants) {
    const path = walk(variant, start, cols, rows, NO_BLOCKS);
    const end = path?.[path.length - 1];
    if (end && !route.has(key(end))) ends.set(key(end), end);
  }
  return [...ends.values()];
}

/**
 * The fewest tokens any shortest route from start to goal needs: squares for
 * arrows notation, straight runs otherwise. Write mode sizes its boxes from
 * this, so any shortest answer fits - not just the route the map was built on.
 */
function shortestAnswer(
  start: Point,
  goal: Point,
  cols: number,
  rows: number,
  blocked: Set<string>,
  notation: Notation
): number {
  // Breadth-first, a layer per square travelled. For each square, the fewest
  // runs among the shortest ways in, by the heading it was entered on.
  const dist = new Map([[key(start), 0]]);
  const runs = new Map<string, Partial<Record<Direction, number>>>();
  let frontier = [start];
  for (let d = 1; frontier.length > 0 && !dist.has(key(goal)); d++) {
    const next: Point[] = [];
    for (const p of frontier) {
      const inbound = runs.get(key(p));
      for (const dir of ALL_DIRECTIONS) {
        const q = { x: p.x + STEP[dir].x, y: p.y + STEP[dir].y };
        const qk = key(q);
        if (q.x < 0 || q.y < 0 || q.x >= cols || q.y >= rows || blocked.has(qk)) continue;
        if (!dist.has(qk)) {
          dist.set(qk, d);
          next.push(q);
        } else if (dist.get(qk) !== d) {
          continue;
        }
        // Carrying on in a straight line costs nothing; turning starts a new run
        const viaHere = inbound
          ? Math.min(...ALL_DIRECTIONS.map(h => (inbound[h] ?? Infinity) + (h === dir ? 0 : 1)))
          : 1;
        const entry = runs.get(qk) ?? {};
        entry[dir] = Math.min(entry[dir] ?? Infinity, viaHere);
        runs.set(qk, entry);
      }
    }
    frontier = next;
  }

  if (notation === 'arrows') return dist.get(key(goal)) ?? 0;
  return Math.min(...Object.values(runs.get(key(goal)) ?? {}));
}

const reaches = (tokens: Token[], start: Point, goal: Point, cols: number, rows: number, blocked: Set<string>) => {
  const path = walk(tokens, start, cols, rows, blocked);
  const end = path ? (path[path.length - 1] ?? start) : undefined;
  return end !== undefined && end.x === goal.x && end.y === goal.y;
};

/** Every token a printed token could have been swapped for. */
function alternatives(token: Token, notation: Notation): Token[] {
  const counts = notation === 'arrows' ? [1] : Array.from({ length: MAX_RUN }, (_, i) => i + 1);
  return ALL_DIRECTIONS.flatMap(dir => counts.map(count => ({ dir, count })))
    .filter(t => t.dir !== token.dir || t.count !== token.count);
}

/**
 * Swaps one token so the route goes wrong, choosing a swap with only one fix:
 * changing any other single token, any other way, doesn't reach the goal.
 */
function plantMistake(
  rng: SeededRandom,
  tokens: Token[],
  notation: Notation,
  start: Point,
  goal: Point,
  cols: number,
  rows: number,
  blocked: Set<string>
) {
  const candidates = rng.shuffle(
    tokens.flatMap((token, index) => alternatives(token, notation).map(wrong => ({ index, wrong })))
  );
  for (const { index, wrong } of candidates) {
    const shown = tokens.map((t, i) => (i === index ? wrong : t));
    if (reaches(shown, start, goal, cols, rows, blocked)) continue;
    const fixes = shown.flatMap((t, i) =>
      alternatives(t, notation).filter(alt =>
        reaches(shown.map((s, j) => (j === i ? alt : s)), start, goal, cols, rows, blocked)
      ).map(() => i)
    );
    if (fixes.length === 1 && fixes[0] === index) {
      return { shown, mistake: { index, correct: tokens[index] } };
    }
  }
  return undefined;
}

/** Landmarks per map: about one per ten squares, at least one, at most four. */
const landmarkCount = (cols: number, rows: number) => Math.min(4, Math.max(1, Math.round((cols * rows) / 10)));

export function generateDirections(
  gridWidth: number,
  gridHeight: number,
  seed: number,
  mode: DirectionsMode,
  notation: Notation,
  length: RouteLength,
  spareBoxes: boolean
): DirectionsPuzzle {
  const rng = new SeededRandom(seed);
  const spares = mode === 'write' && spareBoxes ? (notation === 'arrows' ? 2 : 1) : 0;

  // Fall back to fewer runs if the map or the strip is too small for the
  // length. A one-line strip leaves more room for the map, so try that first.
  for (let moveCount = MOVES_FOR_LENGTH[length]; moveCount >= 1; moveCount--) {
    for (const stripLines of [1, 2]) {
      const { cols, rows, cellMm } = mapSize(gridWidth, gridHeight, stripLines);
      const tokenLimit = maxTokens(gridWidth, notation, stripLines);

      for (let attempt = 0; attempt < ROUTE_TRIES; attempt++) {
        const route = randomRoute(rng, cols, rows, moveCount);
        if (!route) continue;
        const tokens = toNotation(route.moves, notation);
        if (tokens.length > tokenLimit) continue;

        const wanted = landmarkCount(cols, rows);
        // Elsewhere there's no wrong end to mark, so fewer, anywhere off the route
        const candidates = mode === 'follow'
          ? mistakeEnds(route.moves, route.start, cols, rows, route.route)
          : Array.from({ length: cols * rows }, (_, i) => ({ x: i % cols, y: Math.floor(i / cols) }))
              .filter(p => !route.route.has(key(p)));
        const landmarks = rng.shuffle(candidates).slice(0, mode === 'follow' ? wanted : Math.ceil(wanted / 2));
        const island = buildIsland(rng, cols, rows, route.route, route.start, landmarks);
        const { blocked } = island;

        const finish = (shown: Token[], extra: Pick<DirectionsPuzzle, 'boxCount' | 'mistake'>): DirectionsPuzzle => {
          // Follow mode hides the goal: finding it is the puzzle
          const goal = mode === 'follow' ? undefined : route.goal;
          const stamps = stampIsland(rng, island, cols, rows, cellMm, route.start, goal);
          // A slow swell and two faster ripples, each heading a random way
          const wobble = {
            terms: [1, 2.6, 5].map(base => {
              const angle = rng.next() * 2 * Math.PI;
              const freq = base * (0.8 + rng.next() * 0.4);
              return { fx: freq * Math.cos(angle), fy: freq * Math.sin(angle), phase: rng.next() * 2 * Math.PI };
            }),
          };
          const { coast, echoes } = traceCoast(cols, rows, cellMm, island.sea, wobble);
          return {
            cols, rows, cellMm, blocked, stamps, coast, echoes,
            start: route.start, goal: route.goal, tokens: shown, stripLines, ...extra,
          };
        };

        if (mode === 'write') {
          const boxCount = shortestAnswer(route.start, route.goal, cols, rows, blocked, notation);
          // The length setting is the answer's length, so the terrain must stop
          // any shorter way there. Otherwise most maps have a two-run shortcut.
          const runs = shortestAnswer(route.start, route.goal, cols, rows, blocked, 'counts');
          if (runs < moveCount || boxCount + spares > tokenLimit) continue;
          return finish(tokens, { boxCount: boxCount + spares });
        }

        if (mode === 'fix') {
          const planted = plantMistake(rng, tokens, notation, route.start, route.goal, cols, rows, blocked);
          if (!planted) continue;
          return finish(planted.shown, { mistake: planted.mistake, boxCount: 0 });
        }

        return finish(tokens, { boxCount: 0 });
      }
    }
  }

  // Unreachable in practice: a one-square route on an empty map always works
  const { cols, rows, cellMm } = mapSize(gridWidth, gridHeight, 1);
  return {
    cols, rows, cellMm, blocked: new Set(), stamps: [], coast: [], echoes: [],
    start: { x: 0, y: 0 }, goal: { x: 1, y: 0 }, tokens: [{ dir: 'right', count: 1 }], boxCount: 1, stripLines: 1,
  };
}
