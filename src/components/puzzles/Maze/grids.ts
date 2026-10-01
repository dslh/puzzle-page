export type GridShape = 'square' | 'hex' | 'triangle';

export interface Point {
  x: number;
  y: number;
}

/**
 * One cell of a maze grid, described by its outline rather than by a
 * row/column, so the generator and renderer never need to know its shape.
 */
export interface GridCell {
  center: Point;
  /** Outline, clockwise. Side i runs from corners[i] to corners[i + 1]. */
  corners: Point[];
  /** neighbors[i] is the cell across side i, or -1 at the edge of the grid. */
  neighbors: number[];
}

export interface Grid {
  /** Row by row: the first cell is top-left, the last is bottom-right. */
  cells: GridCell[];
  width: number;
  height: number;
  /** Radius of the largest circle that fits inside a cell. */
  inradius: number;
}

/**
 * Cell sizes, in units of one square cell. Chosen so each shape leaves about
 * the same room for a pencil, not so they have the same number of cells:
 * - a hexagon only opens along one edge (0.58 of its width), so it is drawn
 *   wider than a square to keep the gaps usable
 * - a triangle opens along a whole side but is cramped inside (the circle
 *   that fits in it is 0.58 of its side), so it gets a longer side
 */
const HEX_WIDTH = 1.25;
const TRIANGLE_SIDE = 1.3;

/** Row-major index of (col, row), or -1 when outside the grid. */
function indexer(cols: number, rows: number) {
  return (col: number, row: number): number =>
    col >= 0 && col < cols && row >= 0 && row < rows ? row * cols + col : -1;
}

function buildSquareGrid(width: number, height: number): Grid {
  const index = indexer(width, height);
  const cells: GridCell[] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      cells.push({
        center: { x: x + 0.5, y: y + 0.5 },
        corners: [
          { x, y },
          { x: x + 1, y },
          { x: x + 1, y: y + 1 },
          { x, y: y + 1 },
        ],
        // Top, right, bottom, left
        neighbors: [index(x, y - 1), index(x + 1, y), index(x, y + 1), index(x - 1, y)],
      });
    }
  }

  return { cells, width, height, inradius: 0.5 };
}

/**
 * Pointy-top hexagons in straight rows, odd rows shifted right by half a cell.
 */
function buildHexGrid(width: number, height: number): Grid {
  const w = HEX_WIDTH;
  const radius = w / Math.sqrt(3); // Centre to corner, also the side length
  const rowPitch = 1.5 * radius;

  const cols = Math.max(2, Math.floor(width / w - 0.5));
  const rows = Math.max(2, Math.floor((height - 2 * radius) / rowPitch) + 1);
  const index = indexer(cols, rows);
  const cells: GridCell[] = [];

  for (let row = 0; row < rows; row++) {
    const shifted = row % 2 === 1;
    // Columns of the cells up-left and up-right (or down-left and down-right)
    const leftCol = (col: number) => (shifted ? col : col - 1);
    const rightCol = (col: number) => (shifted ? col + 1 : col);

    for (let col = 0; col < cols; col++) {
      const cx = w * (col + (shifted ? 1 : 0.5));
      const cy = radius + row * rowPitch;

      cells.push({
        center: { x: cx, y: cy },
        corners: [
          { x: cx, y: cy - radius },
          { x: cx + w / 2, y: cy - radius / 2 },
          { x: cx + w / 2, y: cy + radius / 2 },
          { x: cx, y: cy + radius },
          { x: cx - w / 2, y: cy + radius / 2 },
          { x: cx - w / 2, y: cy - radius / 2 },
        ],
        // Up-right, right, down-right, down-left, left, up-left
        neighbors: [
          index(rightCol(col), row - 1),
          index(col + 1, row),
          index(rightCol(col), row + 1),
          index(leftCol(col), row + 1),
          index(col - 1, row),
          index(leftCol(col), row - 1),
        ],
      });
    }
  }

  return {
    cells,
    width: w * (cols + 0.5),
    height: 2 * radius + (rows - 1) * rowPitch,
    inradius: w / 2,
  };
}

/**
 * Equilateral triangles in rows, alternately pointing up and down. Each one
 * overlaps the next by half a side, and meets the row above or below along
 * whichever of its sides is horizontal.
 */
function buildTriangleGrid(width: number, height: number): Grid {
  const side = TRIANGLE_SIDE;
  const rowHeight = (side * Math.sqrt(3)) / 2;

  const cols = Math.max(3, Math.floor((2 * width) / side - 1));
  const rows = Math.max(2, Math.floor(height / rowHeight));
  const index = indexer(cols, rows);
  const cells: GridCell[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const left = (col * side) / 2;
      const top = row * rowHeight;
      const pointsUp = (row + col) % 2 === 0;

      if (pointsUp) {
        cells.push({
          center: { x: left + side / 2, y: top + (rowHeight * 2) / 3 },
          corners: [
            { x: left + side / 2, y: top },
            { x: left + side, y: top + rowHeight },
            { x: left, y: top + rowHeight },
          ],
          // Right, below, left
          neighbors: [index(col + 1, row), index(col, row + 1), index(col - 1, row)],
        });
      } else {
        cells.push({
          center: { x: left + side / 2, y: top + rowHeight / 3 },
          corners: [
            { x: left, y: top },
            { x: left + side, y: top },
            { x: left + side / 2, y: top + rowHeight },
          ],
          // Above, right, left
          neighbors: [index(col, row - 1), index(col + 1, row), index(col - 1, row)],
        });
      }
    }
  }

  return {
    cells,
    width: ((cols + 1) * side) / 2,
    height: rows * rowHeight,
    inradius: rowHeight / 3,
  };
}

/**
 * Build a grid that fits inside width x height, measured in square cells. A
 * square grid fills that area exactly; the others fit as many of their own
 * cells as they can and report the size they actually cover.
 */
export function buildGrid(shape: GridShape, width: number, height: number): Grid {
  switch (shape) {
    case 'square':
      return buildSquareGrid(width, height);
    case 'hex':
      return buildHexGrid(width, height);
    case 'triangle':
      return buildTriangleGrid(width, height);
  }
}
