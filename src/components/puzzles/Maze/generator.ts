import { buildGrid, type Grid, type GridCell, type GridShape, type Point } from './grids';
import { buildRegionGrid } from './region';
import { answerPath } from '../../../utils/answerPath';
import { SeededRandom } from '../../../utils/random';

export interface Wall {
  from: Point;
  to: Point;
}

export interface Maze {
  cells: GridCell[];
  solution: number[];
  /** Every wall still standing, including the outer edge of the maze. */
  walls: Wall[];
  width: number;
  height: number;
  /** Radius of the largest circle that fits inside a cell. */
  inradius: number;
  /** Indices into cells */
  start: number;
  end: number;
}

export type Branchiness = 'low' | 'medium' | 'high';
/** Which way the passages run: across, down, or neither. On rings, across is round and down is out. */
export type Grain = 'across' | 'even' | 'down';
/** Whether the carving keeps going the way it was heading, turns, or doesn't mind. */
export type Turns = 'straight' | 'mixed' | 'zigzag';

/** How carving is steered, beyond branchiness. */
export interface Steering {
  grain: Grain;
  turns: Turns;
}

const EVEN: Steering = { grain: 'even', turns: 'mixed' };

/**
 * How much more likely a favoured step is than an unfavoured one. Strong
 * enough to see at a glance, short of laying the maze out in plain rows: a
 * grain much stronger makes the route a zig-zag down the rows.
 */
const GRAIN_WEIGHT = 4;
const TURNS_WEIGHT = 4;

function getBranchProbability(branchiness: Branchiness): number {
  switch (branchiness) {
    case 'low':
      return 0.0; // Pure DFS - long corridors
    case 'medium':
      return 0.3; // Mix of corridors and branches
    case 'high':
      return 0.6; // More branches, shorter corridors
  }
}

/**
 * Generate a maze using the Growing Tree algorithm.
 * The 'branchiness' parameter controls the branching factor.
 * - 'low': Recursive backtracker (long corridors)
 * - 'medium': Mix of backtracker and random walk
 * - 'high': Prim's algorithm (many short branches)
 *
 * The algorithm only ever asks a cell for its neighbours, so it works the same
 * on any grid shape. Width and height are in square cells - see buildGrid.
 *
 * Suitable for 4-5 year olds (small, simple mazes)
 */
export function generateMaze(
  width: number = 6,
  height: number = 6,
  seed?: number,
  branchiness: Branchiness = 'medium',
  shape: GridShape = 'square',
  steering: Steering = EVEN
): Maze {
  const random = seed ? new SeededRandom(seed) : null;
  const next = () => (random ? random.next() : Math.random());
  return carveMaze(buildGrid(shape, width, height, next), next, branchiness, steering);
}

/**
 * A maze over the free squares of a page (see `buildRegionGrid`), in square
 * cells measured from the page's top left, `ratio` to a page square. Null
 * when the space is too small for one.
 */
export function generateRegionMaze(
  region: string,
  ratio: number,
  seed: number,
  branchiness: Branchiness,
  shape: GridShape,
  steering: Steering = EVEN
): Maze | null {
  const random = seed ? new SeededRandom(seed) : null;
  const next = () => (random ? random.next() : Math.random());
  const grid = buildRegionGrid(shape, region, ratio, next);
  return grid && carveMaze(grid, next, branchiness, steering);
}

const unit = (from: Point, to: Point): Point => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  return { x: dx / length, y: dy / length };
};

/**
 * How much to favour a step from one cell to the next, heading `step` (a unit
 * vector, centre to centre), when the carving came in heading `heading`. 1
 * when nothing is favoured. Works on any tiling: a step is favoured in
 * proportion to how closely it lines up, so hexagons' slanted steps count
 * part way.
 */
function stepWeight(grid: Grid, from: Point, step: Point, heading: Point | null, steering: Steering): number {
  let weight = 1;
  if (steering.grain !== 'even') {
    // How much of the step is along the favoured way, 0..1. On rings, down
    // and across turn with the cell: out from the hub, and round it.
    const out = grid.hub ? unit(grid.hub, from) : { x: 0, y: 1 };
    const along = (step.x * out.x + step.y * out.y) ** 2;
    const favoured = steering.grain === 'down' ? along : 1 - along;
    weight *= 1 + (GRAIN_WEIGHT - 1) * favoured;
  }
  if (steering.turns !== 'mixed' && heading) {
    const ahead = step.x * heading.x + step.y * heading.y;
    // Straight favours carrying on; zig-zag favours a square turn, and a
    // turn back on itself (on triangles) as much as one ahead
    const favoured = steering.turns === 'straight' ? Math.max(0, ahead) ** 2 : 1 - ahead ** 2;
    weight *= 1 + (TURNS_WEIGHT - 1) * favoured;
  }
  return weight;
}

function carveMaze(grid: Grid, next: () => number, branchiness: Branchiness, steering: Steering): Maze {
  const branchProbability = getBranchProbability(branchiness);
  const steered = steering.grain !== 'even' || steering.turns !== 'mixed';

  // Start with every wall standing
  const { cells } = grid;
  const visited = cells.map(() => false);
  const passages = cells.map(() => new Set<number>());
  /** The way the carving was heading when it reached each cell */
  const headings: (Point | null)[] = cells.map(() => null);

  // Use Growing Tree algorithm to carve paths
  const stack: number[] = [];
  visited[grid.start] = true;
  stack.push(grid.start);

  while (stack.length > 0) {
    const randomValue = next();
    const index =
      randomValue < branchProbability
        ? Math.floor(next() * stack.length)
        : stack.length - 1;
    const current = stack[index];
    const neighbors = [...new Set(cells[current].neighbors.filter((n) => n !== -1 && !visited[n]))];

    if (neighbors.length > 0) {
      // Choose random unvisited neighbor. Unsteered, every one is as likely,
      // drawn just as before steering existed, so saved pages come out the same.
      let chosen: number;
      if (steered) {
        const from = cells[current].center;
        const steps = neighbors.map((n) => unit(from, cells[n].center));
        const weights = steps.map((step) => stepWeight(grid, from, step, headings[current], steering));
        let pick = next() * weights.reduce((a, b) => a + b, 0);
        let k = 0;
        while (k < neighbors.length - 1 && (pick -= weights[k]) >= 0) k++;
        chosen = neighbors[k];
        headings[chosen] = steps[k];
      } else {
        chosen = neighbors[Math.floor(next() * neighbors.length)];
      }

      // Remove wall between current and the chosen neighbour
      passages[current].add(chosen);
      passages[chosen].add(current);

      visited[chosen] = true;
      stack.push(chosen);
    } else {
      // No unvisited neighbors, remove this cell from the stack
      stack.splice(index, 1);
    }
  }

  // Collect the walls that were never carved through. A wall between two cells
  // is a side of both, so take it from the lower-numbered cell only.
  const walls: Wall[] = [];
  cells.forEach((cell, i) => {
    cell.neighbors.forEach((neighbor, side) => {
      const isEdge = neighbor === -1;
      const isWall = neighbor > i && !passages[i].has(neighbor);
      if (isEdge || isWall) {
        walls.push({
          from: cell.corners[side],
          to: cell.corners[(side + 1) % cell.corners.length],
        });
      }
    });
  });

  return {
    cells,
    solution: answerPath(grid.start, grid.end, node => passages[node]),
    walls,
    width: grid.width,
    height: grid.height,
    inradius: grid.inradius,
    start: grid.start,
    end: grid.end,
  };
}
