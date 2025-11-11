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

/**
 * Generate a maze using recursive backtracking algorithm
 * Suitable for 4-5 year olds (small, simple mazes)
 */
export function generateMaze(
  width: number = 6,
  height: number = 6,
  seed?: number
): Maze {
  const random = seed ? new SeededRandom(seed) : null;
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

  // Recursive backtracking to carve paths
  const stack: Cell[] = [];
  const startCell = grid[0][0];
  startCell.visited = true;
  stack.push(startCell);

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const neighbors = getUnvisitedNeighbors(current, grid, width, height);

    if (neighbors.length > 0) {
      // Choose random unvisited neighbor
      const randomValue = random ? random.next() : Math.random();
      const next = neighbors[Math.floor(randomValue * neighbors.length)];

      // Remove wall between current and next
      removeWall(current, next);

      next.visited = true;
      stack.push(next);
    } else {
      stack.pop();
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
