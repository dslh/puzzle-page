import { OUTLINES, buildConcentricGrid } from './concentric';
import { fitTiling, gridFromPolygons, type Tiling } from './polygons';
import { buildVoronoiGrid } from './voronoi';

/** Tilings of the whole area, and ring shapes (see concentric.ts) */
export type GridShape =
  | 'square'
  | 'hex'
  | 'triangle'
  | 'rhombille'
  | 'snubsquare'
  | 'cairo'
  | 'voronoi'
  | keyof typeof OUTLINES;

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
  /**
   * neighbors[i] is the cell across side i, or -1 at the edge of the grid.
   * The same neighbour may appear more than once when the shared boundary
   * bends - it is one wall as far as the maze is concerned.
   */
  neighbors: number[];
}

export interface Grid {
  cells: GridCell[];
  width: number;
  height: number;
  /** Radius of the largest circle that fits inside a cell (the start and end cells, at least). */
  inradius: number;
  /** Indices into cells */
  start: number;
  end: number;
}

/**
 * Cell sizes, in units of one square cell. Chosen so each shape leaves about
 * the same room for a pencil, not so they have the same number of cells:
 * - a hexagon only opens along one edge (0.58 of its width), so it is drawn
 *   wider than a square to keep the gaps usable
 * - a triangle opens along a whole side but is cramped inside (the circle
 *   that fits in it is 0.58 of its side), so it gets a longer side
 * - a rhombus is a square pushed over, which narrows it, so its side is a
 *   little longer than a square's
 * - the snub square tiling is cramped by its triangles, so its side is the
 *   triangle's
 * - a Cairo pentagon is roomy inside but its shortest side is only 0.42 of the
 *   pitch, so that side is what gets matched to the hexagon's
 */
const HEX_WIDTH = 1.25;
const TRIANGLE_SIDE = 1.3;
const RHOMBUS_SIDE = 1.1;
const SNUB_SQUARE_SIDE = 1.3;
/** Distance between the corners where four pentagons meet */
const CAIRO_PITCH = 1.7;

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

  return { cells, width, height, inradius: 0.5, start: 0, end: cells.length - 1 };
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
    start: 0,
    end: cells.length - 1,
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
    start: 0,
    end: cells.length - 1,
  };
}

/**
 * Rhombille tiling: hexagons each cut into three rhombuses, which reads as a
 * stack of cubes seen corner-on. The origin is the bottom corner of the first
 * hexagon, where six rhombuses meet.
 */
function rhombilleTiling(): Tiling {
  const side = RHOMBUS_SIDE;
  const halfWidth = (side * Math.sqrt(3)) / 2;

  const tiles: Point[][] = [];
  for (const centre of [
    { x: 0, y: -side },
    { x: halfWidth, y: side / 2 },
  ]) {
    // Corners of the hexagon, clockwise from the top
    const corner = (k: number): Point => ({
      x: centre.x + side * Math.sin((k * Math.PI) / 3),
      y: centre.y - side * Math.cos((k * Math.PI) / 3),
    });
    // Top, right and left faces of the cube
    tiles.push(
      [centre, corner(5), corner(0), corner(1)],
      [centre, corner(1), corner(2), corner(3)],
      [centre, corner(3), corner(4), corner(5)]
    );
  }

  return { tiles, period: { x: 2 * halfWidth, y: 3 * side } };
}

/**
 * The snub square and Cairo tilings are two views of one pattern: rhombuses
 * centred on the points of a square lattice, alternately lying flat and
 * standing upright like the colours of a checkerboard. Each tiling describes
 * the tiles around one rhombus - `along` its long diagonal and `across` it -
 * and this repeats them at every lattice point, turned to suit.
 */
function rhombusLattice(pitch: number, tilesAround: (at: (along: number, across: number) => Point) => Point[][]): Tiling {
  const tiles: Point[][] = [];
  for (const row of [0, 1]) {
    for (const col of [0, 1]) {
      const upright = (row + col) % 2 === 1;
      tiles.push(
        ...tilesAround((along, across) => ({
          x: col * pitch + (upright ? across : along),
          y: row * pitch + (upright ? along : across),
        }))
      );
    }
  }
  return { tiles, period: { x: 2 * pitch, y: 2 * pitch } };
}

/**
 * Snub square tiling: squares and equilateral triangles, five to a corner.
 * The triangles come in pairs that make the lattice's rhombuses, and the
 * squares fill the gaps between them.
 */
function snubSquareTiling(): Tiling {
  const side = SNUB_SQUARE_SIDE;
  const pitch = (side * (1 + Math.sqrt(3))) / 2;
  const long = (side * Math.sqrt(3)) / 2;
  const short = side / 2;

  return rhombusLattice(pitch, (at) => [
    [at(-long, 0), at(0, -short), at(0, short)],
    [at(long, 0), at(0, short), at(0, -short)],
    // The square in the gap between this rhombus and the next three round,
    // tilted 15 degrees: its corners are corners of those four rhombuses
    [at(long, 0), at(pitch, long), at(short, pitch), at(0, short)],
  ]);
}

/**
 * Cairo tiling: pentagons that meet four to a corner at the lattice's squares
 * (the middles of the snub square tiling's squares) and three to a corner in
 * between (the middles of its triangles). Two pentagons sit back to back on
 * each rhombus, sharing their one short side.
 */
function cairoTiling(): Tiling {
  const pitch = CAIRO_PITCH;
  const half = pitch / 2;
  // Half the short side
  const stub = pitch / (3 + Math.sqrt(3));

  return rhombusLattice(pitch, (at) =>
    [-1, 1].map((facing) => [
      at(-stub, 0),
      at(stub, 0),
      at(half, facing * half),
      at(0, facing * (pitch - stub)),
      at(-half, facing * half),
    ])
  );
}

/**
 * Build a grid that fits inside width x height, measured in square cells. A
 * square grid fills that area exactly, as does a Voronoi one; the other
 * tilings fit as many of their own cells as they can, and the ring shapes
 * scale to fit. All report the size they actually cover.
 *
 * Only the Voronoi grid is random. The rest never call `random`, so they leave
 * the caller's sequence where it was.
 */
export function buildGrid(shape: GridShape, width: number, height: number, random: () => number): Grid {
  switch (shape) {
    case 'square':
      return buildSquareGrid(width, height);
    case 'hex':
      return buildHexGrid(width, height);
    case 'triangle':
      return buildTriangleGrid(width, height);
    case 'rhombille':
      return gridFromPolygons(fitTiling(rhombilleTiling(), width, height));
    case 'snubsquare':
      return gridFromPolygons(fitTiling(snubSquareTiling(), width, height));
    case 'cairo':
      return gridFromPolygons(fitTiling(cairoTiling(), width, height));
    case 'voronoi':
      return buildVoronoiGrid(width, height, random);
    default:
      return buildConcentricGrid(OUTLINES[shape], width, height);
  }
}
