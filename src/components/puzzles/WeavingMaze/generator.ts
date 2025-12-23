export interface WeavingCell {
  x: number;
  y: number;
  connections: {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  };
  crossing: { overDirection: 'horizontal' | 'vertical' } | null;
  visited: boolean;
}

export interface WeavingMaze {
  grid: WeavingCell[][];
  width: number;
  height: number;
  start: { x: number; y: number };
  end: { x: number; y: number };
}

export type CrossingDensity = 'few' | 'medium' | 'many';

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

export function generateWeavingMaze(
  width: number,
  height: number,
  seed: number,
  crossingDensity: CrossingDensity = 'medium'
): WeavingMaze {
  const rng = new SeededRandom(seed);

  // Phase 1: Initialize grid with no connections
  const grid = initializeGrid(width, height);

  // Phase 2: Generate base maze using recursive backtracking
  generateBaseMaze(grid, width, height, rng);

  // Phase 3: Insert crossings based on density
  insertCrossings(grid, width, height, rng, crossingDensity);

  return {
    grid,
    width,
    height,
    start: { x: 0, y: 0 },
    end: { x: width - 1, y: height - 1 },
  };
}

function initializeGrid(width: number, height: number): WeavingCell[][] {
  const grid: WeavingCell[][] = [];
  for (let y = 0; y < height; y++) {
    grid[y] = [];
    for (let x = 0; x < width; x++) {
      grid[y][x] = {
        x,
        y,
        connections: { top: false, right: false, bottom: false, left: false },
        crossing: null,
        visited: false,
      };
    }
  }
  return grid;
}

function generateBaseMaze(
  grid: WeavingCell[][],
  width: number,
  height: number,
  rng: SeededRandom
): void {
  const stack: WeavingCell[] = [];
  const startCell = grid[0][0];
  startCell.visited = true;
  stack.push(startCell);

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const neighbors = getUnvisitedNeighbors(current, grid, width, height);

    if (neighbors.length > 0) {
      const next = neighbors[Math.floor(rng.next() * neighbors.length)];
      addConnection(current, next);
      next.visited = true;
      stack.push(next);
    } else {
      stack.pop();
    }
  }
}

function getUnvisitedNeighbors(
  cell: WeavingCell,
  grid: WeavingCell[][],
  width: number,
  height: number
): WeavingCell[] {
  const neighbors: WeavingCell[] = [];
  const { x, y } = cell;

  if (y > 0 && !grid[y - 1][x].visited) neighbors.push(grid[y - 1][x]);
  if (x < width - 1 && !grid[y][x + 1].visited) neighbors.push(grid[y][x + 1]);
  if (y < height - 1 && !grid[y + 1][x].visited) neighbors.push(grid[y + 1][x]);
  if (x > 0 && !grid[y][x - 1].visited) neighbors.push(grid[y][x - 1]);

  return neighbors;
}

function addConnection(a: WeavingCell, b: WeavingCell): void {
  const dx = b.x - a.x;
  const dy = b.y - a.y;

  if (dx === 1) {
    a.connections.right = true;
    b.connections.left = true;
  } else if (dx === -1) {
    a.connections.left = true;
    b.connections.right = true;
  } else if (dy === 1) {
    a.connections.bottom = true;
    b.connections.top = true;
  } else if (dy === -1) {
    a.connections.top = true;
    b.connections.bottom = true;
  }
}

function insertCrossings(
  grid: WeavingCell[][],
  width: number,
  height: number,
  rng: SeededRandom,
  density: CrossingDensity
): void {
  const maxCrossings = getMaxCrossings(width, height, density);
  let crossingsAdded = 0;

  // Find all candidate cells (interior cells that form straight corridors)
  const candidates: WeavingCell[] = [];
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      candidates.push(grid[y][x]);
    }
  }

  // Shuffle candidates
  shuffleArray(candidates, rng);

  for (const cell of candidates) {
    if (crossingsAdded >= maxCrossings) break;

    const { connections } = cell;
    const isHorizontalCorridor =
      connections.left &&
      connections.right &&
      !connections.top &&
      !connections.bottom;
    const isVerticalCorridor =
      connections.top &&
      connections.bottom &&
      !connections.left &&
      !connections.right;

    if (isHorizontalCorridor) {
      // Try to add vertical crossing (vertical goes over)
      const top = grid[cell.y - 1][cell.x];
      const bottom = grid[cell.y + 1][cell.x];

      // Can add crossing if top and bottom neighbors aren't already connected to this cell
      if (!cell.connections.top && !cell.connections.bottom) {
        // Add the perpendicular connection
        cell.connections.top = true;
        cell.connections.bottom = true;
        top.connections.bottom = true;
        bottom.connections.top = true;

        cell.crossing = { overDirection: 'vertical' };
        crossingsAdded++;
      }
    } else if (isVerticalCorridor) {
      // Try to add horizontal crossing (horizontal goes over)
      const left = grid[cell.y][cell.x - 1];
      const right = grid[cell.y][cell.x + 1];

      if (!cell.connections.left && !cell.connections.right) {
        cell.connections.left = true;
        cell.connections.right = true;
        left.connections.right = true;
        right.connections.left = true;

        cell.crossing = { overDirection: 'horizontal' };
        crossingsAdded++;
      }
    }
  }
}

function getMaxCrossings(
  width: number,
  height: number,
  density: CrossingDensity
): number {
  const minDim = Math.min(width, height);
  switch (density) {
    case 'few':
      return Math.max(1, Math.floor(minDim / 4));
    case 'medium':
      return Math.max(2, Math.floor(minDim / 2));
    case 'many':
      return Math.max(3, minDim);
  }
}

function shuffleArray<T>(array: T[], rng: SeededRandom): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
