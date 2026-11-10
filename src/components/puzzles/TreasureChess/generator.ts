import { CELL_SIZE_MM } from '../../../types/puzzle';
import { SeededRandom } from '../../../utils/random';
import { shortestRoute } from '../ChessMoves/generator';
import { randomWobble, traceCoast } from '../Directions/coast';
import type { Point } from '../Directions/generator';
import { buildIsland, stampIsland, type Stamp } from '../Directions/island';

/*
 * A chess piece crossing Directions' treasure island to the chest. The island
 * is laid out around the squares that must stay sand (start, chest, things to
 * collect), then the chess route search finds the fewest moves. Maps are kept
 * only if the trees and rocks make the route longer than on open sand, so the
 * island is part of the puzzle, not scenery.
 */

export type TreasurePiece = 'rook' | 'bishop' | 'knight' | 'queen';
export type PieceChoice = TreasurePiece | 'mixed';
export type TreasureLength = 'short' | 'medium' | 'long';
/** What lies on the way, to land on before the chest. One kind per map. */
export type Pickup = 'compass' | 'flag';

export const PIECES: TreasurePiece[] = ['rook', 'bishop', 'knight', 'queen'];
const PICKUPS: Pickup[] = ['compass', 'flag'];

export interface TreasurePuzzle {
  cols: number;
  rows: number;
  /** Map square size, in mm. */
  cellMm: number;
  piece: TreasurePiece;
  /** Squares are numbered `y * cols + x`, as in the chess puzzles. */
  start: number;
  goal: number;
  pickup: Pickup;
  pickups: number[];
  sea: Set<number>;
  /** Squares no piece may land on or pass: sea, terrain and landmarks. */
  blocked: Set<number>;
  /** A fewest-moves route, every square landed on from the start. */
  route: number[];
  /** Everything drawn on the map, in mm: sea, terrain, ship, chest. */
  stamps: Stamp[];
  /** Coastline loops and the echo lines out to sea, as SVG path data in mm. */
  coast: string[];
  echoes: string[];
}

/*
 * Layout in mm, matching TreasureChess.module.css. Change them together.
 */
const CONTAINER_PAD_MM = 2;
export const PROMPT_MM = 7;
const STACK_GAP_MM = 2;
export const CAPTION_MM = 6;
/** Room for the map's outer border, which sits outside its squares. */
const MAP_BORDER_MM = 1;
/** Big enough to count, draw in and see the piece; the pieces are checked at 9mm. */
const MIN_CELL_MM = 11;
const MAX_CELL_MM = 17;
/** More squares than this makes a long hunt and a slow search; a big puzzle gets bigger squares instead. */
const MAX_COLS = 10;
const MAX_ROWS = 12;

/** Fewest moves to the chest, by length, before adding a move for each thing to collect. */
const MOVES: Record<TreasureLength, [number, number]> = {
  short: [2, 3],
  medium: [4, 4],
  long: [5, 6],
};

/**
 * Share of the land that gets trees and rocks. The knight jumps them, so it
 * needs more of them before they change its route.
 */
const DENSITY: Record<TreasurePiece, number> = { rook: 0.3, bishop: 0.3, queen: 0.35, knight: 0.4 };

const TRIES = 400;

/** The squares' count and size that cover the most of the space, square sizes kept within range. */
function mapSize(gridWidth: number, gridHeight: number, caption: boolean) {
  const width = gridWidth * CELL_SIZE_MM - 2 * CONTAINER_PAD_MM - MAP_BORDER_MM;
  const height = gridHeight * CELL_SIZE_MM - 2 * CONTAINER_PAD_MM - PROMPT_MM - STACK_GAP_MM
    - (caption ? CAPTION_MM + STACK_GAP_MM : 0) - MAP_BORDER_MM;
  let best = { cols: 3, rows: 3, cellMm: Math.min(width, height) / 3 };
  let bestArea = 0;
  for (let cols = 3; cols * MIN_CELL_MM <= width && cols <= MAX_COLS; cols++) {
    for (let rows = 3; rows * MIN_CELL_MM <= height && rows <= MAX_ROWS; rows++) {
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

const key = (p: Point) => `${p.x},${p.y}`;
const fromKey = (k: string): Point => {
  const [x, y] = k.split(',').map(Number);
  return { x, y };
};

/** The ship moors in a square on the edge; the piece waits on the sand next to it. */
function landing(rng: SeededRandom, cols: number, rows: number) {
  const side = rng.nextInt(4);
  const along = (n: number) => rng.nextIntRange(1, n - 2);
  if (side === 0) { const x = along(cols); return { harbour: { x, y: 0 }, start: { x, y: 1 } }; }
  if (side === 1) { const y = along(rows); return { harbour: { x: cols - 1, y }, start: { x: cols - 2, y } }; }
  if (side === 2) { const x = along(cols); return { harbour: { x, y: rows - 1 }, start: { x, y: rows - 2 } }; }
  const y = along(rows);
  return { harbour: { x: 0, y }, start: { x: 1, y } };
}

export function generateTreasureChess(
  gridWidth: number,
  gridHeight: number,
  seed: number,
  pieceChoice: PieceChoice,
  length: TreasureLength,
  pickupCount: number,
  caption: boolean
): TreasurePuzzle {
  const rng = new SeededRandom(seed);
  const piece = pieceChoice === 'mixed' ? rng.pick(PIECES) : pieceChoice;
  const pickup = rng.pick(PICKUPS);
  const { cols, rows, cellMm } = mapSize(gridWidth, gridHeight, caption);
  const square = (p: Point) => p.y * cols + p.x;
  const numbers = (keys: Iterable<string>) => new Set([...keys].map(k => square(fromKey(k))));

  // Each thing to collect is roughly one more move
  const fewest = MOVES[length][0] + pickupCount;
  const most = MOVES[length][1] + pickupCount;
  // The chest is at least half the map away
  const farEnough = Math.ceil(Math.max(cols, rows) / 2);
  const landmarkCount = Math.min(3, Math.max(1, Math.round((cols * rows) / 20)));

  interface Candidate {
    island: ReturnType<typeof buildIsland>;
    harbour: Point;
    start: Point;
    goal: Point;
    pickups: Point[];
    route: number[];
  }
  let fallback: { candidate: Candidate; score: number } | undefined;
  let chosen: Candidate | undefined;

  for (let attempt = 0; attempt < TRIES && !chosen; attempt++) {
    const { harbour, start } = landing(rng, cols, rows);
    const all = Array.from({ length: cols * rows }, (_, i) => ({ x: i % cols, y: Math.floor(i / cols) }))
      .filter(p => key(p) !== key(harbour) && key(p) !== key(start));
    // A bishop never leaves its colour, so the chest and pickups are on it
    const onColour = (p: Point) => piece !== 'bishop' || (p.x + p.y) % 2 === (start.x + start.y) % 2;
    const far = all.filter(p => onColour(p) && Math.max(Math.abs(p.x - start.x), Math.abs(p.y - start.y)) >= farEnough);
    if (far.length === 0) continue;
    const goal = rng.pick(far);
    const rest = all.filter(p => key(p) !== key(goal));
    const reachable = rest.filter(onColour);
    const pickups = rng.pickUnique(reachable, Math.min(reachable.length, pickupCount));
    const others = rest.filter(p => !pickups.includes(p));
    const landmarks = rng.pickUnique(others, Math.min(others.length, landmarkCount));

    const keepClear = new Set([start, goal, ...pickups].map(key));
    const island = buildIsland(rng, cols, rows, keepClear, harbour, landmarks, DENSITY[piece]);
    const blocked = numbers(island.blocked);
    const route = shortestRoute(piece, cols, rows, square(start), pickups.map(square), blocked, square(goal));
    if (!route) continue;

    const moves = route.length - 1;
    const candidate = { island, harbour, start, goal, pickups, route };
    const miss = moves < fewest ? fewest - moves : moves > most ? moves - most : 0;
    // On open sand (only the sea in the way), the route must be longer: the
    // island has to matter. Missing that counts as half a move off. Not for
    // the knight: it has so many ways round that trees seldom lengthen a short
    // route, and counting out its L is puzzle enough.
    const matters = piece === 'knight' ||
      // Never null: fewer squares are blocked than on the island
      shortestRoute(piece, cols, rows, square(start), pickups.map(square), numbers(island.sea), square(goal))!.length < route.length;
    const score = miss + (matters ? 0 : 0.5);
    if (score === 0) chosen = candidate;
    else if (!fallback || score < fallback.score) fallback = { candidate, score };
  }

  // Unreachable in practice: hundreds of tries always find a route of some length
  const result = chosen ?? fallback?.candidate;
  if (!result) {
    return {
      cols, rows, cellMm, piece, start: 0, goal: 1, pickup, pickups: [], sea: new Set(), blocked: new Set(), route: [0, 1],
      stamps: [], coast: [], echoes: [],
    };
  }

  const { island, harbour, start, goal, pickups, route } = result;
  // No decorative compass when compasses are what the child collects
  const stamps = stampIsland(rng, island, cols, rows, cellMm, harbour, goal, pickup !== 'compass',
    pickups.map(at => ({ icon: pickup, at })));
  const { coast, echoes } = traceCoast(cols, rows, cellMm, island.sea, randomWobble(rng));

  return {
    cols, rows, cellMm, piece,
    start: square(start), goal: square(goal),
    pickup, pickups: pickups.map(square),
    sea: numbers(island.sea),
    blocked: numbers(island.blocked),
    route, stamps, coast, echoes,
  };
}
