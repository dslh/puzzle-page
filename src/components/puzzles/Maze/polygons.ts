import { clearance } from './concentric';
import type { Grid, GridCell, Point } from './grids';

/**
 * Grids made from a loose pile of polygons, for tilings whose cells don't fall
 * into rows and columns. Nobody has to say which cell is next to which: two
 * cells are neighbours when they share a side, corner for corner.
 */

/** Corners closer together than this are the same corner. */
const SNAP = 1e-4;

const cornerKey = (p: Point): string => `${Math.round(p.x / SNAP)},${Math.round(p.y / SNAP)}`;

/** Twice the area of a polygon; positive when it runs clockwise on screen. */
function signedArea(corners: Point[]): number {
  return corners.reduce((sum, a, i) => {
    const b = corners[(i + 1) % corners.length];
    return sum + a.x * b.y - b.x * a.y;
  }, 0);
}

export function centroid(corners: Point[]): Point {
  let x = 0;
  let y = 0;
  corners.forEach((a, i) => {
    const b = corners[(i + 1) % corners.length];
    const cross = a.x * b.y - b.x * a.y;
    x += (a.x + b.x) * cross;
    y += (a.y + b.y) * cross;
  });
  const area = signedArea(corners);
  return { x: x / (3 * area), y: y / (3 * area) };
}

/**
 * Turn polygons into a grid. They can be listed in any order and wound either
 * way, but must meet edge to edge - a corner of one part-way along the side of
 * another leaves that side unmatched, and so a wall.
 *
 * Sides shorter than minGap are never opened: both cells keep them as walls.
 * The maze runs from the cell nearest the top-left to the one nearest the
 * bottom-right.
 */
export function gridFromPolygons(polygons: Point[][], minGap = 0): Grid {
  // Shift everything so the bounding box starts at the origin
  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;
  for (const polygon of polygons) {
    for (const p of polygon) {
      left = Math.min(left, p.x);
      top = Math.min(top, p.y);
      right = Math.max(right, p.x);
      bottom = Math.max(bottom, p.y);
    }
  }
  const width = right - left;
  const height = bottom - top;

  const cells: GridCell[] = polygons.map((polygon) => {
    const corners = polygon.map((p) => ({ x: p.x - left, y: p.y - top }));
    if (signedArea(corners) < 0) corners.reverse();
    return { center: centroid(corners), corners, neighbors: corners.map(() => -1) };
  });

  // Pair up the sides. One that never finds a partner is the edge of the grid.
  const unpaired = new Map<string, { cell: number; side: number }>();
  cells.forEach((cell, i) => {
    cell.corners.forEach((from, side) => {
      const to = cell.corners[(side + 1) % cell.corners.length];
      if (Math.hypot(to.x - from.x, to.y - from.y) < minGap) return;

      const [a, b] = [cornerKey(from), cornerKey(to)].sort();
      if (a === b) return;
      const key = `${a} ${b}`;
      const partner = unpaired.get(key);
      if (!partner) {
        unpaired.set(key, { cell: i, side });
        return;
      }
      unpaired.delete(key);
      cell.neighbors[side] = partner.cell;
      cells[partner.cell].neighbors[partner.side] = i;
    });
  });

  const nearest = (target: Point): number => {
    const distance = (cell: GridCell) => Math.hypot(cell.center.x - target.x, cell.center.y - target.y);
    return cells.reduce((best, cell, i) => (distance(cell) < distance(cells[best]) ? i : best), 0);
  };
  const start = nearest({ x: 0, y: 0 });
  const end = nearest({ x: width, y: height });

  return {
    cells,
    width,
    height,
    inradius: Math.min(clearance(cells[start].center, cells[start].corners), clearance(cells[end].center, cells[end].corners)),
    start,
    end,
  };
}

/** A pattern of polygons that repeats across and down. */
export interface Tiling {
  /**
   * The polygons of one repeat. Put the origin where two of the tiling's
   * mirror lines cross: that placement is tried first and wins ties, and it
   * makes the ragged edge of the maze symmetrical.
   */
  tiles: Point[][];
  /** The pattern repeats every period.x across and period.y down. */
  period: Point;
}

/** Positions to try in each direction when fitting a tiling to an area. */
const FIT_STEPS = 12;

/**
 * The cells of a tiling that fit whole inside width x height. How many do
 * depends on where the pattern sits - a small maze can gain or lose a third
 * of its cells - so slide it about under the area and keep the fullest.
 */
export function fitTiling({ tiles, period }: Tiling, width: number, height: number): Point[][] {
  const inside = (p: Point) => p.x >= -SNAP && p.x <= width + SNAP && p.y >= -SNAP && p.y <= height + SNAP;

  let best: Point[][] = [];
  for (let stepY = 0; stepY < FIT_STEPS; stepY++) {
    for (let stepX = 0; stepX < FIT_STEPS; stepX++) {
      // Where the tiling's origin lands; at the centre of the area to begin with
      const originX = width / 2 - (stepX * period.x) / FIT_STEPS;
      const originY = height / 2 - (stepY * period.y) / FIT_STEPS;
      // One repeat further than the area in every direction, as tiles overhang their own repeat
      const firstCol = Math.floor(-originX / period.x) - 1;
      const lastCol = Math.ceil((width - originX) / period.x) + 1;
      const firstRow = Math.floor(-originY / period.y) - 1;
      const lastRow = Math.ceil((height - originY) / period.y) + 1;

      const fitted: Point[][] = [];
      for (let row = firstRow; row <= lastRow; row++) {
        for (let col = firstCol; col <= lastCol; col++) {
          for (const tile of tiles) {
            const placed = tile.map((p) => ({ x: p.x + originX + col * period.x, y: p.y + originY + row * period.y }));
            if (placed.every(inside)) fitted.push(placed);
          }
        }
      }
      if (fitted.length > best.length) best = fitted;
    }
  }
  return best;
}
