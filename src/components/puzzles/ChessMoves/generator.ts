import { SeededRandom } from '../../../utils/random';

export type ChessPiece = 'rook' | 'bishop' | 'queen' | 'king' | 'knight';
export type PieceChoice = ChessPiece | 'mixed';
export type MovesMode = 'where' | 'collect';
export type BoardSize = 4 | 5 | 6;

/** The order children usually meet them: straight lines first, the knight last. */
export const PIECES: ChessPiece[] = ['rook', 'bishop', 'queen', 'king', 'knight'];

const STRAIGHT: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const DIAGONAL: [number, number][] = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
const STEPS: Record<ChessPiece, [number, number][]> = {
  rook: STRAIGHT,
  bishop: DIAGONAL,
  queen: [...STRAIGHT, ...DIAGONAL],
  king: [...STRAIGHT, ...DIAGONAL],
  knight: [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]],
};
const SLIDES: Record<ChessPiece, boolean> = { rook: true, bishop: true, queen: true, king: false, knight: false };

/**
 * Squares are numbered across then down: `y * n + x`, with y = 0 the top row.
 * Pieces stop before a blocker, never on it: blockers are the child's own
 * pieces. The knight jumps, so only its landing square matters.
 */
export function movesFrom(piece: ChessPiece, from: number, n: number, blocked: ReadonlySet<number>): number[] {
  const fx = from % n, fy = Math.floor(from / n);
  const result: number[] = [];
  for (const [dx, dy] of STEPS[piece]) {
    let x = fx + dx, y = fy + dy;
    while (x >= 0 && y >= 0 && x < n && y < n && !blocked.has(y * n + x)) {
      result.push(y * n + x);
      if (!SLIDES[piece]) break;
      x += dx; y += dy;
    }
  }
  return result;
}

export interface WhereBoard {
  mode: 'where';
  piece: ChessPiece;
  n: number;
  at: number;
  blockers: number[];
  reach: number[];
}

export interface CollectBoard {
  mode: 'collect';
  piece: ChessPiece;
  n: number;
  at: number;
  blockers: number[];
  stars: number[];
  /** A shortest route: every square landed on, from the start. */
  route: number[];
}

export type Board = WhereBoard | CollectBoard;

function blockerCount(rng: SeededRandom, mode: MovesMode, n: number): number {
  if (n <= 4) return rng.nextIntRange(1, 2);
  if (mode === 'collect' && n >= 6) return rng.nextIntRange(2, 4);
  return rng.nextIntRange(2, 3);
}

function pickSquares(rng: SeededRandom, n: number, count: number, taken: ReadonlySet<number>): number[] {
  const free = Array.from({ length: n * n }, (_, i) => i).filter(i => !taken.has(i));
  return rng.pickUnique(free, count);
}

const NONE: ReadonlySet<number> = new Set();

function whereBoard(rng: SeededRandom, piece: ChessPiece, n: number, blockers: boolean): WhereBoard {
  let fallback: WhereBoard | undefined;
  for (let attempt = 0; attempt < 200; attempt++) {
    const at = rng.nextInt(n * n);
    const placed = blockers ? pickSquares(rng, n, blockerCount(rng, 'where', n), new Set([at])) : [];
    const blocked = new Set(placed);
    const reach = movesFrom(piece, at, n, blocked);
    const board: WhereBoard = { mode: 'where', piece, n, at, blockers: placed, reach };
    fallback ??= board;
    if (reach.length < 3) continue;
    // A blocker earns its place by standing where the piece could otherwise go.
    if (blockers) {
      const open = new Set(movesFrom(piece, at, n, NONE));
      if (!placed.some(b => open.has(b))) continue;
    }
    return board;
  }
  return fallback!;
}

/** Fewest moves that land on every star, by breadth-first search over (square, stars landed on). */
function shortestRoute(piece: ChessPiece, n: number, at: number, stars: number[], blocked: ReadonlySet<number>): number[] | null {
  const all = (1 << stars.length) - 1;
  const starBit = new Map(stars.map((s, i) => [s, 1 << i]));
  const key = (square: number, mask: number) => square * (all + 1) + mask;
  const previous = new Map<number, number>([[key(at, 0), -1]]);
  let frontier = [key(at, 0)];
  while (frontier.length) {
    const next: number[] = [];
    for (const state of frontier) {
      const square = Math.floor(state / (all + 1)), mask = state % (all + 1);
      if (mask === all) {
        const route: number[] = [];
        for (let s = state; s !== -1; s = previous.get(s)!) route.unshift(Math.floor(s / (all + 1)));
        return route;
      }
      for (const to of movesFrom(piece, square, n, blocked)) {
        const k = key(to, mask | (starBit.get(to) ?? 0));
        if (previous.has(k)) continue;
        previous.set(k, state);
        next.push(k);
      }
    }
    frontier = next;
  }
  return null;
}

function collectBoard(rng: SeededRandom, piece: ChessPiece, n: number, blockers: boolean, starCount: number): CollectBoard {
  // Short enough to plan, long enough to need planning.
  const fewest = Math.max(2, starCount), most = starCount + 3;
  let fallback: CollectBoard | undefined;
  for (let attempt = 0; attempt < 400; attempt++) {
    const at = rng.nextInt(n * n);
    const placed = blockers ? pickSquares(rng, n, blockerCount(rng, 'collect', n), new Set([at])) : [];
    const stars = pickSquares(rng, n, starCount, new Set([at, ...placed]));
    const route = shortestRoute(piece, n, at, stars, new Set(placed));
    if (!route) continue;
    const board: CollectBoard = { mode: 'collect', piece, n, at, blockers: placed, stars, route };
    const moves = route.length - 1;
    if (moves >= fewest && moves <= most) return board;
    fallback ??= board;
  }
  return fallback!;
}

export interface ChessMovesOptions {
  mode: MovesMode;
  piece: PieceChoice;
  boardSize: BoardSize;
  blockers: boolean;
  stars: number;
}

/**
 * Each board has its own random sequence, so making the puzzle bigger adds
 * boards and keeps the ones already there.
 */
export function generateBoards(seed: number, count: number, options: ChessMovesOptions): Board[] {
  const order = options.piece === 'mixed' ? new SeededRandom(seed).shuffle(PIECES) : [options.piece];
  return Array.from({ length: count }, (_, index) => {
    const rng = new SeededRandom((seed ^ Math.imul(index + 1, 0x9e3779b1)) >>> 0);
    const piece = order[index % order.length];
    return options.mode === 'where'
      ? whereBoard(rng, piece, options.boardSize, options.blockers)
      : collectBoard(rng, piece, options.boardSize, options.blockers, options.stars);
  });
}

// Layout, in mm.
export const HEADER = 9;
const MARGIN = 3;
const GAP = 5;
export const CAPTION = 5;
const MIN_SQUARE: Record<MovesMode, number> = { where: 9, collect: 11 };
const MAX_BOARDS = 6;

export interface MovesLayout {
  width: number;
  height: number;
  cols: number;
  rows: number;
  square: number;
  /** Top-left corner of each board. */
  origins: [number, number][];
}

/** As many boards as fit with squares big enough to draw in, then the biggest squares. */
export function movesLayout(gridWidth: number, gridHeight: number, n: number, mode: MovesMode, cellMm: number): MovesLayout {
  const width = gridWidth * cellMm, height = gridHeight * cellMm;
  const caption = mode === 'collect' ? CAPTION : 0;
  const squareFor = (cols: number, rows: number) => Math.min(
    (width - 2 * MARGIN - (cols - 1) * GAP) / (cols * n),
    (height - HEADER - MARGIN - rows * caption - (rows - 1) * GAP) / (rows * n),
  );
  let best = { cols: 1, rows: 1, square: squareFor(1, 1) };
  for (let cols = 1; cols <= MAX_BOARDS; cols++) {
    for (let rows = 1; cols * rows <= MAX_BOARDS; rows++) {
      const square = squareFor(cols, rows);
      if (square < MIN_SQUARE[mode]) continue;
      const count = cols * rows, bestCount = best.cols * best.rows;
      if (count > bestCount || (count === bestCount && square > best.square)) best = { cols, rows, square };
    }
  }
  const { cols, rows, square } = best;
  const side = square * n;
  const usedW = cols * side + (cols - 1) * GAP;
  const usedH = rows * (side + caption) + (rows - 1) * GAP;
  const left = (width - usedW) / 2;
  const top = HEADER + (height - HEADER - MARGIN - usedH) / 2;
  const origins: [number, number][] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) origins.push([left + c * (side + GAP), top + r * (side + caption + GAP)]);
  }
  return { width, height, cols, rows, square, origins };
}
