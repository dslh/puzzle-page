export interface WeavingCell {
  x: number;
  y: number;
  connections: {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  };
  visited: boolean;
}

export interface Bridge {
  start: { x: number; y: number };
  end: { x: number; y: number };
  direction: 'horizontal' | 'vertical';
  segments: { x: number; y: number }[];
}

export interface WeavingMaze {
  grid: WeavingCell[][];
  bridges: Bridge[];
  width: number;
  height: number;
  start: { x: number; y: number };
  end: { x: number; y: number };
}

export type CrossingDensity = 'few' | 'medium' | 'many';
export type Branchiness = 'low' | 'medium' | 'high';

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

interface BridgeOpportunity {
  target: WeavingCell;
  segments: WeavingCell[];
  direction: 'horizontal' | 'vertical';
}

export function generateWeavingMaze(
  width: number,
  height: number,
  seed: number,
  crossingDensity: CrossingDensity = 'medium',
  branchiness: Branchiness = 'medium'
): WeavingMaze {
  const rng = new SeededRandom(seed);
  const grid = initializeGrid(width, height);
  const bridges: Bridge[] = [];
  const bridgeProbability = getBridgeProbability(crossingDensity);
  const branchProbability = getBranchProbability(branchiness);

  // Start at top-left
  const start = grid[0][0];
  start.visited = true;
  const stack: WeavingCell[] = [start];

  while (stack.length > 0) {
    // Growing Tree algorithm: sometimes pick random cell from stack (creates branches)
    // vs always picking newest (pure DFS, creates long corridors)
    const index = rng.next() < branchProbability
      ? Math.floor(rng.next() * stack.length)
      : stack.length - 1;
    const current = stack[index];

    // Find both options
    const bridgeResult = findBridgeOpportunity(current, grid, width, height, rng);
    const neighbors = getUnvisitedNeighbors(current, grid, width, height);

    if (bridgeResult && neighbors.length > 0) {
      // Both available - use probability to decide
      if (rng.next() < bridgeProbability) {
        useBridge(current, bridgeResult, bridges, stack);
      } else {
        useNeighbor(current, neighbors, stack, rng);
      }
    } else if (bridgeResult) {
      useBridge(current, bridgeResult, bridges, stack);
    } else if (neighbors.length > 0) {
      useNeighbor(current, neighbors, stack, rng);
    } else {
      // No moves available - remove this cell from the stack
      stack.splice(index, 1);
    }
  }

  return {
    grid,
    bridges,
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
        visited: false,
      };
    }
  }
  return grid;
}

function getBridgeProbability(density: CrossingDensity): number {
  switch (density) {
    case 'few':
      return 0.3;
    case 'medium':
      return 0.6;
    case 'many':
      return 0.9;
  }
}

function getBranchProbability(branchiness: Branchiness): number {
  switch (branchiness) {
    case 'low':
      return 0.0;  // Pure DFS - long corridors
    case 'medium':
      return 0.3;  // Mix of corridors and branches
    case 'high':
      return 0.6;  // More branches, shorter corridors
  }
}

function useBridge(
  current: WeavingCell,
  bridgeResult: BridgeOpportunity,
  bridges: Bridge[],
  stack: WeavingCell[]
): void {
  const bridge: Bridge = {
    start: { x: current.x, y: current.y },
    end: { x: bridgeResult.target.x, y: bridgeResult.target.y },
    direction: bridgeResult.direction,
    segments: bridgeResult.segments.map((cell) => ({ x: cell.x, y: cell.y })),
  };
  bridges.push(bridge);
  bridgeResult.target.visited = true;
  stack.push(bridgeResult.target);
}

function useNeighbor(
  current: WeavingCell,
  neighbors: WeavingCell[],
  stack: WeavingCell[],
  rng: SeededRandom
): void {
  const next = neighbors[Math.floor(rng.next() * neighbors.length)];
  addConnection(current, next);
  next.visited = true;
  stack.push(next);
}

function findBridgeOpportunity(
  current: WeavingCell,
  grid: WeavingCell[][],
  width: number,
  height: number,
  rng: SeededRandom
): BridgeOpportunity | null {
  const opportunities: BridgeOpportunity[] = [];

  // Scan all four directions
  const directions: Array<{ dx: number; dy: number; dir: 'horizontal' | 'vertical' }> = [
    { dx: 0, dy: -1, dir: 'vertical' },   // up
    { dx: 0, dy: 1, dir: 'vertical' },    // down
    { dx: 1, dy: 0, dir: 'horizontal' },  // right
    { dx: -1, dy: 0, dir: 'horizontal' }, // left
  ];

  for (const { dx, dy, dir } of directions) {
    const result = scanForBridgeTarget(current, dx, dy, dir, grid, width, height);
    if (result) {
      opportunities.push(result);
    }
  }

  if (opportunities.length === 0) {
    return null;
  }

  return opportunities[Math.floor(rng.next() * opportunities.length)];
}

function scanForBridgeTarget(
  start: WeavingCell,
  dx: number,
  dy: number,
  bridgeDirection: 'horizontal' | 'vertical',
  grid: WeavingCell[][],
  width: number,
  height: number
): BridgeOpportunity | null {
  let x = start.x;
  let y = start.y;
  const bridgeCells: WeavingCell[] = [];

  while (true) {
    // Move one step in scan direction
    x += dx;
    y += dy;

    // Out of bounds?
    if (x < 0 || x >= width || y < 0 || y >= height) {
      return null;
    }

    const cell = grid[y][x];

    // Found an unvisited cell - valid bridge target!
    if (!cell.visited) {
      if (bridgeCells.length === 0) {
        // Adjacent unvisited cell - not a bridge, just normal connection
        return null;
      }
      return {
        target: cell,
        segments: bridgeCells,
        direction: bridgeDirection,
      };
    }

    // Cell is visited - can we bridge over it?
    if (canBridgeOver(cell, bridgeDirection)) {
      bridgeCells.push(cell);
    } else {
      // Obstacle - can't bridge here
      return null;
    }
  }
}

function canBridgeOver(cell: WeavingCell, bridgeDirection: 'horizontal' | 'vertical'): boolean {
  if (bridgeDirection === 'horizontal') {
    // Horizontal bridge needs complete vertical passage underneath
    const hasPerpendicularPassage = cell.connections.top && cell.connections.bottom;
    // Must not have horizontal passages (would be hidden by bridge)
    const hasParallelPassage = cell.connections.left || cell.connections.right;
    return hasPerpendicularPassage && !hasParallelPassage;
  } else {
    // Vertical bridge needs complete horizontal passage underneath
    const hasPerpendicularPassage = cell.connections.left && cell.connections.right;
    // Must not have vertical passages (would be hidden by bridge)
    const hasParallelPassage = cell.connections.top || cell.connections.bottom;
    return hasPerpendicularPassage && !hasParallelPassage;
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
