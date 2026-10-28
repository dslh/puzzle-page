import { GRID_COLS, GRID_ROWS } from '../types/puzzle';
import type { PlacedPuzzle, PuzzleType } from '../types/puzzle';

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

/** The first free spot for a puzzle of this size, reading the page like a book. */
export function findFreeSpot(
  puzzles: PlacedPuzzle[],
  width: number,
  height: number,
): { x: number; y: number } | null {
  for (let y = 0; y + height <= GRID_ROWS; y++) {
    for (let x = 0; x + width <= GRID_COLS; x++) {
      if (!collides(puzzles, x, y, width, height)) return { x, y };
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
