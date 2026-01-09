export interface Cell {
  x: number;
  y: number;
  walls: {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  };
  visited: boolean;
}

export interface Maze {
  grid: Cell[][];
  width: number;
  height: number;
  start: { x: number; y: number };
  end: { x: number; y: number };
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
 * Suitable for 4-5 year olds (small, simple mazes)
 */
export function generateMaze(
  width: number = 6,
  height: number = 6,
  seed?: number,
  branchiness: Branchiness = 'medium'
): Maze {
  const random = seed ? new SeededRandom(seed) : null;
  const branchProbability = getBranchProbability(branchiness);

  // Initialize grid with all walls
  const grid: Cell[][] = [];
  for (let y = 0; y < height; y++) {
    grid[y] = [];
    for (let x = 0; x < width; x++) {
      grid[y][x] = {
        x,
        y,
        walls: { top: true, right: true, bottom: true, left: true },
        visited: false,
      };
    }
  }

  // Use Growing Tree algorithm to carve paths
  const stack: Cell[] = [];
  const startCell = grid[0][0];
  startCell.visited = true;
  stack.push(startCell);

  while (stack.length > 0) {
    const randomValue = random ? random.next() : Math.random();
    const index =
      randomValue < branchProbability
        ? Math.floor((random ? random.next() : Math.random()) * stack.length)
        : stack.length - 1;
    const current = stack[index];
    const neighbors = getUnvisitedNeighbors(current, grid, width, height);

    if (neighbors.length > 0) {
      // Choose random unvisited neighbor
      const nextRandomValue = random ? random.next() : Math.random();
      const next = neighbors[Math.floor(nextRandomValue * neighbors.length)];

      // Remove wall between current and next
      removeWall(current, next);

      next.visited = true;
      stack.push(next);
    } else {
      // No unvisited neighbors, remove this cell from the stack
      stack.splice(index, 1);
    }
  }

  // Set start and end points
  const start = { x: 0, y: 0 };
  const end = { x: width - 1, y: height - 1 };

  return {
    grid,
    width,
    height,
    start,
    end,
  };
}

function getUnvisitedNeighbors(
  cell: Cell,
  grid: Cell[][],
  width: number,
  height: number
): Cell[] {
  const neighbors: Cell[] = [];
  const { x, y } = cell;

  // Top
  if (y > 0 && !grid[y - 1][x].visited) {
    neighbors.push(grid[y - 1][x]);
  }
  // Right
  if (x < width - 1 && !grid[y][x + 1].visited) {
    neighbors.push(grid[y][x + 1]);
  }
  // Bottom
  if (y < height - 1 && !grid[y + 1][x].visited) {
    neighbors.push(grid[y + 1][x]);
  }
  // Left
  if (x > 0 && !grid[y][x - 1].visited) {
    neighbors.push(grid[y][x - 1]);
  }

  return neighbors;
}

function removeWall(current: Cell, next: Cell): void {
  const dx = current.x - next.x;
  const dy = current.y - next.y;

  if (dx === 1) {
    // Next is to the left
    current.walls.left = false;
    next.walls.right = false;
  } else if (dx === -1) {
    // Next is to the right
    current.walls.right = false;
    next.walls.left = false;
  } else if (dy === 1) {
    // Next is above
    current.walls.top = false;
    next.walls.bottom = false;
  } else if (dy === -1) {
    // Next is below
    current.walls.bottom = false;
    next.walls.top = false;
  }
}
