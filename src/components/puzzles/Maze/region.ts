import { GRID_COLS, GRID_ROWS } from '../../../types/puzzle';
import { regionHas } from '../../../utils/placement';
import { OUTLINES, clearance } from './concentric';
import { buildGrid, type Grid, type GridShape, type Point } from './grids';

/**
 * Mazes that fill the gaps on a page (a filler, see `PlacedPuzzle.fill`): any
 * tiling, laid over the whole page, keeping only the cells that sit in the
 * free squares. The generator never knew the shape of its grid, so the rest
 * is just a maze.
 */

/**
 * How near, in square cells, the maze comes to another puzzle or the page
 * edge. Square cells line up with the page's squares, so half a cell all
 * round costs exactly one cell across a gap. The other tilings don't line
 * up, so already lose a ragged strip at every edge; a full half cell more
 * would close up gaps one page square wide.
 */
const SQUARE_MARGIN = 0.5;
const OTHER_MARGIN = 0.2;
/** Fewer cells than this is no maze: the filler draws nothing. */
const MIN_CELLS = 6;

/** Cells reachable from `from`, by distance in steps. -1 where unreachable. */
function distancesFrom(neighbors: number[][], from: number): number[] {
  const distance = neighbors.map(() => -1);
  distance[from] = 0;
  const queue = [from];
  for (let i = 0; i < queue.length; i++) {
    for (const next of neighbors[queue[i]]) {
      if (next !== -1 && distance[next] === -1) {
        distance[next] = distance[queue[i]] + 1;
        queue.push(next);
      }
    }
  }
  return distance;
}

const farthest = (distance: number[]) =>
  distance.reduce((best, d, i) => (d > distance[best] ? i : best), 0);

/**
 * A grid over the free squares of `region`, in square cells with `ratio` of
 * them to a page square, measured from the page's top left. The biggest gap
 * only, when the free space comes in pieces. The maze runs between the two
 * cells furthest apart, so in an L or a U it goes round the bend. Null when
 * the gap holds too few cells for a maze.
 *
 * The ring shapes have no tiling to cut a gap from, so they come out as squares.
 */
export function buildRegionGrid(shape: GridShape, region: string, ratio: number, random: () => number): Grid | null {
  const width = GRID_COLS * ratio;
  const height = GRID_ROWS * ratio;
  const tiling = shape in OUTLINES ? 'square' : shape;
  const margin = tiling === 'square' ? SQUARE_MARGIN : OTHER_MARGIN;

  // The page inset by the margin, so square cells sit exactly that far in
  // from the edges of the page's own squares
  const page = buildGrid(tiling, width - 2 * margin, height - 2 * margin, random);
  const shift = (p: Point): Point => ({ x: p.x + margin, y: p.y + margin });

  // A point is clear when everything within the margin of it is free.
  // Just inside the margin, so a corner exactly that far from a taken
  // square still counts.
  const reach = margin - 1e-6;
  const free = (x: number, y: number) => regionHas(region, Math.floor(x / ratio), Math.floor(y / ratio));
  const clear = (p: Point) => free(p.x - reach, p.y - reach) && free(p.x + reach, p.y - reach)
    && free(p.x - reach, p.y + reach) && free(p.x + reach, p.y + reach);

  // Every corner and the middle of every side, or a long side could clip
  // the corner of a puzzle between two clear corners
  const kept = page.cells.map(cell => cell.corners.every((from, side) => {
    const to = cell.corners[(side + 1) % cell.corners.length];
    return clear(shift(from)) && clear(shift({ x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 }));
  }));
  const neighbors = page.cells.map((cell, i) =>
    kept[i] ? cell.neighbors.map(n => (n !== -1 && kept[n] ? n : -1)) : []);

  // The biggest piece
  const seen = kept.map(k => !k);
  let piece: number[] = [];
  kept.forEach((k, i) => {
    if (!k || seen[i]) return;
    const distance = distancesFrom(neighbors, i);
    const cells = distance.flatMap((d, j) => (d === -1 ? [] : [j]));
    cells.forEach(j => { seen[j] = true; });
    if (cells.length > piece.length) piece = cells;
  });
  if (piece.length < MIN_CELLS) return null;

  // Renumber the piece's cells, with every side that left it now an edge
  const index = new Map(piece.map((old, i) => [old, i]));
  const cells = piece.map(old => {
    const cell = page.cells[old];
    return {
      center: shift(cell.center),
      corners: cell.corners.map(shift),
      neighbors: neighbors[old].map(n => index.get(n) ?? -1),
    };
  });

  // Furthest from anywhere, then furthest from that: the ends of (about) the
  // longest way across the gap. The start is the one nearer the top left.
  const all = cells.map(cell => cell.neighbors);
  const one = farthest(distancesFrom(all, 0));
  const other = farthest(distancesFrom(all, one));
  const sum = (i: number) => cells[i].center.x + cells[i].center.y;
  const [start, end] = sum(one) <= sum(other) ? [one, other] : [other, one];

  return {
    cells,
    width,
    height,
    inradius: Math.min(
      clearance(cells[start].center, cells[start].corners),
      clearance(cells[end].center, cells[end].corners),
    ),
    start,
    end,
  };
}
