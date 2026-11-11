import type { Point } from './grids';

/** Sample a line this often, in cells, so no step jumps a cell */
const SAMPLE_STEP = 0.1;

/**
 * The cells a pencil line along `points` passes through, on a square grid
 * `width` cells across (cell index = row * width + col), each beside the
 * last and none twice. That is a route a maze can be carved around.
 *
 * Where the line cuts a cell's corner, the cell it passes nearer is added,
 * so steps are never diagonal. Where it comes back to a cell it has been in
 * (a tight point, a narrow neck), the loop between is cut out. A closed
 * outline is broken where it starts: the first and last cells come out side
 * by side, to be split by a wall.
 *
 * Null if cutting loops out lost so much the shape would not be known.
 */
export function cellRoute(points: Point[], width: number, height: number, closed: boolean): number[] | null {
  const line = closed ? [...points, points[0]] : points;
  const cellOf = (p: Point) => ({
    col: Math.min(width - 1, Math.max(0, Math.floor(p.x))),
    row: Math.min(height - 1, Math.max(0, Math.floor(p.y))),
  });

  // Every cell the line enters, in order, with corner cuts filled in
  const walk: number[] = [];
  let last = cellOf(line[0]);
  walk.push(last.row * width + last.col);
  for (let i = 1; i < line.length; i++) {
    const a = line[i - 1];
    const b = line[i];
    const steps = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / SAMPLE_STEP));
    for (let s = 1; s <= steps; s++) {
      const p = { x: a.x + ((b.x - a.x) * s) / steps, y: a.y + ((b.y - a.y) * s) / steps };
      const cell = cellOf(p);
      if (cell.col === last.col && cell.row === last.row) continue;
      if (cell.col !== last.col && cell.row !== last.row) {
        // Diagonal: go through whichever of the two cells between is nearer the line
        const across = { col: cell.col, row: last.row };
        const down = { col: last.col, row: cell.row };
        const gap = (c: { col: number; row: number }) => Math.hypot(c.col + 0.5 - p.x, c.row + 0.5 - p.y);
        const via = gap(across) < gap(down) ? across : down;
        walk.push(via.row * width + via.col);
      }
      walk.push(cell.row * width + cell.col);
      last = cell;
    }
  }
  // A closed line ends back in the first cell; stop just short of it
  if (closed) while (walk.length > 1 && walk[walk.length - 1] === walk[0]) walk.pop();

  // Cut out loops: on coming back to a cell, drop everything since
  const route: number[] = [];
  const at = new Map<number, number>();
  for (const cell of walk) {
    const earlier = at.get(cell);
    if (earlier !== undefined) {
      for (const dropped of route.splice(earlier + 1)) at.delete(dropped);
      continue;
    }
    at.set(cell, route.length);
    route.push(cell);
  }

  const distinct = new Set(walk).size;
  return route.length >= 8 && route.length >= 0.7 * distinct ? route : null;
}
