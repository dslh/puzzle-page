import { GRID_COLS, GRID_ROWS } from '../types/puzzle';
import type { PlacedPuzzle, PuzzleType, ResizableConfig } from '../types/puzzle';

/**
 * Whether a puzzle at (x, y) of the given size would leave the page or overlap
 * another puzzle (AABB). `excludeId` skips the puzzle being moved or resized,
 * so it doesn't collide with itself.
 */
export function collides(
  puzzles: PlacedPuzzle[],
  x: number,
  y: number,
  width: number,
  height: number,
  excludeId?: string,
): boolean {
  if (x < 0 || y < 0 || x + width > GRID_COLS || y + height > GRID_ROWS) {
    return true;
  }

  return puzzles.some(puzzle => {
    if (puzzle.id === excludeId) return false;
    const xOverlap = x < puzzle.x + puzzle.width && x + width > puzzle.x;
    const yOverlap = y < puzzle.y + puzzle.height && y + height > puzzle.y;
    return xOverlap && yOverlap;
  });
}

export interface Placement {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * The sizes a new puzzle may take, best first: its default, then smaller ones
 * down to its minimum on each side it resizes. Never bigger than the default.
 * Biggest area first; between equal areas, the one closest to the default's
 * shape.
 */
export function fitSizes(
  width: number,
  height: number,
  resizable?: ResizableConfig,
): { width: number; height: number }[] {
  const minWidth = resizable?.width ? Math.min(resizable.minWidth || 1, width) : width;
  const minHeight = resizable?.height ? Math.min(resizable.minHeight || 1, height) : height;
  const shape = Math.log(width / height);
  const sizes = [];
  for (let w = width; w >= minWidth; w--) {
    for (let h = height; h >= minHeight; h--) sizes.push({ width: w, height: h });
  }
  return sizes.sort((a, b) =>
    b.width * b.height - a.width * a.height
    || Math.abs(Math.log(a.width / a.height) - shape) - Math.abs(Math.log(b.width / b.height) - shape));
}

/**
 * The first free spot for a new puzzle, reading the page like a book. At its
 * default size if there's room anywhere, else shrunk to the biggest size that
 * fits (see `fitSizes`).
 */
export function findFreeSpot(
  puzzles: PlacedPuzzle[],
  width: number,
  height: number,
  resizable?: ResizableConfig,
): Placement | null {
  for (const size of fitSizes(width, height, resizable)) {
    for (let y = 0; y + size.height <= GRID_ROWS; y++) {
      for (let x = 0; x + size.width <= GRID_COLS; x++) {
        if (!collides(puzzles, x, y, size.width, size.height)) return { x, y, ...size };
      }
    }
  }
  return null;
}

/**
 * Where a new puzzle dropped on a cell lands: the biggest size that fits (see
 * `fitSizes`) covering that cell, nudged as little as it can from having its
 * top left corner there. Null if it can't fit over the cell even at its minimum.
 */
export function fitAtCell(
  puzzles: PlacedPuzzle[],
  cell: { x: number; y: number },
  width: number,
  height: number,
  resizable?: ResizableConfig,
): Placement | null {
  for (const size of fitSizes(width, height, resizable)) {
    const nudges = [];
    for (let dy = 0; dy < size.height; dy++) {
      for (let dx = 0; dx < size.width; dx++) nudges.push({ dx, dy });
    }
    nudges.sort((a, b) => a.dx + a.dy - (b.dx + b.dy));
    for (const { dx, dy } of nudges) {
      const x = cell.x - dx;
      const y = cell.y - dy;
      if (!collides(puzzles, x, y, size.width, size.height)) return { x, y, ...size };
    }
  }
  return null;
}

export function newPlacedPuzzle(
  type: string,
  x: number,
  y: number,
  width: number,
  height: number,
  config: unknown,
  entry?: string,
): PlacedPuzzle {
  return {
    id: `${type}-${Date.now()}-${Math.random()}`,
    type: type as PuzzleType,
    x,
    y,
    seed: Date.now() + Math.floor(Math.random() * 1000),
    width,
    height,
    config,
    entry,
  };
}
