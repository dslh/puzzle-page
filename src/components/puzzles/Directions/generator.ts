import { CELL_SIZE_MM } from '../../../types/puzzle';

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

export type Theme = 'robot' | 'treasure';

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
  /** Emoji on each blocked square, keyed `x,y`. */
  obstacles: Map<string, string>;
  start: Point;
  goal: Point;
  /** The route as printed. In fix mode it holds the mistake. */
  tokens: Token[];
  /** Fix mode: which token is wrong, and what it should be. */
  mistake?: { index: number; correct: Token };
  /** Write mode: how many answer boxes to draw. */
  boxCount: number;
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
/** The strip under the map always holds two lines of tokens. */
const STRIP_LINES = 2;
const STRIP_MM = STRIP_LINES * TOKEN_MM + (STRIP_LINES - 1) * TOKEN_GAP_MM;
/** Map squares are kept near this size - big enough to count and draw in. */
const TARGET_CELL_MM = 14;

export const TOKEN_WIDTH_MM: Record<Notation, number> = {
  arrows: TOKEN_MM,
  counts: 15,
  words: 22,
};

const MOVES_FOR_LENGTH: Record<RouteLength, number> = {
  short: 2,
  medium: 3,
  long: 5,
};

/** Longest straight run, in squares. Kept low so the counts stay countable. */
const MAX_RUN = 3;
/** Share of the squares off the route that get an obstacle. */
const OBSTACLE_DENSITY = 0.25;
const ROUTE_TRIES = 200;

export const DIRECTION_ARROWS: Record<Direction, string> = {
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
};

const STEP: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const ALL_DIRECTIONS: Direction[] = ['up', 'right', 'down', 'left'];

const isHorizontal = (dir: Direction) => dir === 'left' || dir === 'right';

export const THEMES: Record<Theme, { start: string; goal: string; obstacles: string[] }> = {
  robot: { start: '🤖', goal: '⭐', obstacles: ['🧱', '📦', '🪨', '🚧'] },
  treasure: { start: '🚩', goal: '❌', obstacles: ['🌳', '🏠', '🌊', '🪨', '⛰️', '🌴'] },
};

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

function mapHeightMm(gridHeight: number): number {
  return gridHeight * CELL_SIZE_MM - 2 * CONTAINER_PAD_MM - PROMPT_MM - STRIP_MM - 2 * STACK_GAP_MM;
}

/** Room for the map's outer border, which sits outside its squares. */
const MAP_BORDER_MM = 1;

function mapSize(gridWidth: number, gridHeight: number) {
  const width = innerWidthMm(gridWidth) - MAP_BORDER_MM;
  const height = mapHeightMm(gridHeight) - MAP_BORDER_MM;
  const cols = Math.max(3, Math.floor(width / TARGET_CELL_MM));
  const rows = Math.max(3, Math.floor(height / TARGET_CELL_MM));
  return { cols, rows, cellMm: Math.min(width / cols, height / rows) };
}

/** How many tokens fit in the strip under the map. */
function maxTokens(gridWidth: number, notation: Notation): number {
  const perLine = Math.floor((innerWidthMm(gridWidth) + TOKEN_GAP_MM) / (TOKEN_WIDTH_MM[notation] + TOKEN_GAP_MM));
  return Math.max(1, perLine) * STRIP_LINES;
}

// --- Routes ---

/** Splits runs into single steps for arrows notation. */
function toNotation(moves: Token[], notation: Notation): Token[] {
  if (notation !== 'arrows') return moves;
  return moves.flatMap(m => Array.from({ length: m.count }, () => ({ dir: m.dir, count: 1 })));
}

/**
 * Walks the tokens from `start`. Returns the squares visited after the start,
 * or undefined if the walk leaves the map or hits an obstacle.
 */
function walk(
  tokens: Token[],
  start: Point,
  cols: number,
  rows: number,
  obstacles: Map<string, string>
): Point[] | undefined {
  const visited: Point[] = [];
  let p = start;
  for (const { dir, count } of tokens) {
    for (let i = 0; i < count; i++) {
      p = { x: p.x + STEP[dir].x, y: p.y + STEP[dir].y };
      if (p.x < 0 || p.y < 0 || p.x >= cols || p.y >= rows || obstacles.has(key(p))) return undefined;
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
  const start = { x: rng.nextInt(cols), y: rng.nextInt(rows) };
  const seen = new Set([key(start)]);
  const moves: Token[] = [];
  let p = start;
  let horizontal = rng.next() < 0.5;

  for (let m = 0; m < moveCount; m++) {
    const options: Token[] = [];
    for (const dir of ALL_DIRECTIONS.filter(d => isHorizontal(d) === horizontal)) {
      for (let count = 1; count <= MAX_RUN; count++) {
        const path = walk([{ dir, count }], p, cols, rows, new Map());
        if (!path || path.some(q => seen.has(key(q)))) break;
        // Runs of one are half as likely: they leave nothing to count
        for (let weight = Math.min(count, 2); weight > 0; weight--) options.push({ dir, count });
      }
    }
    if (options.length === 0) return undefined;
    const move = rng.pick(options);
    for (const q of walk([move], p, cols, rows, new Map())!) {
      seen.add(key(q));
      p = q;
    }
    moves.push(move);
    horizontal = !horizontal;
  }
  return { start, goal: p, moves, route: seen };
}

function placeObstacles(rng: SeededRandom, cols: number, rows: number, route: Set<string>, theme: Theme) {
  const obstacles = new Map<string, string>();
  const emoji = THEMES[theme].obstacles;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const k = key({ x, y });
      if (!route.has(k) && rng.next() < OBSTACLE_DENSITY) obstacles.set(k, rng.pick(emoji));
    }
  }
  return obstacles;
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
  obstacles: Map<string, string>,
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
        if (q.x < 0 || q.y < 0 || q.x >= cols || q.y >= rows || obstacles.has(qk)) continue;
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

const reaches = (tokens: Token[], start: Point, goal: Point, cols: number, rows: number, obstacles: Map<string, string>) => {
  const path = walk(tokens, start, cols, rows, obstacles);
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
  obstacles: Map<string, string>
) {
  const candidates = rng.shuffle(
    tokens.flatMap((token, index) => alternatives(token, notation).map(wrong => ({ index, wrong })))
  );
  for (const { index, wrong } of candidates) {
    const shown = tokens.map((t, i) => (i === index ? wrong : t));
    if (reaches(shown, start, goal, cols, rows, obstacles)) continue;
    const fixes = shown.flatMap((t, i) =>
      alternatives(t, notation).filter(alt =>
        reaches(shown.map((s, j) => (j === i ? alt : s)), start, goal, cols, rows, obstacles)
      ).map(() => i)
    );
    if (fixes.length === 1 && fixes[0] === index) {
      return { shown, mistake: { index, correct: tokens[index] } };
    }
  }
  return undefined;
}

export function generateDirections(
  gridWidth: number,
  gridHeight: number,
  seed: number,
  mode: DirectionsMode,
  notation: Notation,
  theme: Theme,
  length: RouteLength,
  spareBoxes: boolean
): DirectionsPuzzle {
  const rng = new SeededRandom(seed);
  const { cols, rows, cellMm } = mapSize(gridWidth, gridHeight);
  const tokenLimit = maxTokens(gridWidth, notation);
  const spares = mode === 'write' && spareBoxes ? (notation === 'arrows' ? 2 : 1) : 0;

  // Fall back to fewer runs if the map or the strip is too small for the length
  for (let moveCount = MOVES_FOR_LENGTH[length]; moveCount >= 1; moveCount--) {
    for (let attempt = 0; attempt < ROUTE_TRIES; attempt++) {
      const route = randomRoute(rng, cols, rows, moveCount);
      if (!route) continue;
      const tokens = toNotation(route.moves, notation);
      if (tokens.length > tokenLimit) continue;

      const obstacles = placeObstacles(rng, cols, rows, route.route, theme);
      const base = { cols, rows, cellMm, obstacles, start: route.start, goal: route.goal };

      if (mode === 'write') {
        const boxCount = shortestAnswer(route.start, route.goal, cols, rows, obstacles, notation);
        // The length setting is the answer's length, so the obstacles must stop
        // any shorter way there. Otherwise most maps have a two-run shortcut.
        const runs = shortestAnswer(route.start, route.goal, cols, rows, obstacles, 'counts');
        if (runs < moveCount || boxCount + spares > tokenLimit) continue;
        return { ...base, tokens, boxCount: boxCount + spares };
      }

      if (mode === 'fix') {
        const planted = plantMistake(rng, tokens, notation, route.start, route.goal, cols, rows, obstacles);
        if (!planted) continue;
        return { ...base, tokens: planted.shown, mistake: planted.mistake, boxCount: 0 };
      }

      return { ...base, tokens, boxCount: 0 };
    }
  }

  // Unreachable in practice: a one-square route on an empty map always works
  const start = { x: 0, y: 0 };
  return {
    cols, rows, cellMm, obstacles: new Map(), start, goal: { x: 1, y: 0 },
    tokens: [{ dir: 'right', count: 1 }], boxCount: 1,
  };
}
