import { buildGrid, type GridCell, type GridShape, type Point } from './grids';

export interface Wall {
  from: Point;
  to: Point;
}

export interface Maze {
  cells: GridCell[];
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

/**
 * Simple seeded random number generator
 */
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

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
  shape: GridShape = 'square'
): Maze {
  const random = seed ? new SeededRandom(seed) : null;
  const branchProbability = getBranchProbability(branchiness);

  // Start with every wall standing
  const grid = buildGrid(shape, width, height);
  const { cells } = grid;
  const visited = cells.map(() => false);
  const passages = cells.map(() => new Set<number>());

  // Use Growing Tree algorithm to carve paths
  const stack: number[] = [];
  visited[grid.start] = true;
  stack.push(grid.start);

  while (stack.length > 0) {
    const randomValue = random ? random.next() : Math.random();
    const index =
      randomValue < branchProbability
        ? Math.floor((random ? random.next() : Math.random()) * stack.length)
        : stack.length - 1;
    const current = stack[index];
    const neighbors = [...new Set(cells[current].neighbors.filter((n) => n !== -1 && !visited[n]))];

    if (neighbors.length > 0) {
      // Choose random unvisited neighbor
      const nextRandomValue = random ? random.next() : Math.random();
      const next = neighbors[Math.floor(nextRandomValue * neighbors.length)];

      // Remove wall between current and next
      passages[current].add(next);
      passages[next].add(current);

      visited[next] = true;
      stack.push(next);
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
    walls,
    width: grid.width,
    height: grid.height,
    inradius: grid.inradius,
    start: grid.start,
    end: grid.end,
  };
}
