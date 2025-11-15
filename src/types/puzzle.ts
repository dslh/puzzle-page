export type PuzzleType = 'maze' | 'sudoku3x3' | 'sudoku4x4' | 'whichdoesntbelong';

export interface PlacedPuzzle {
  id: string;
  type: PuzzleType;
  x: number; // grid column (0-9)
  y: number; // grid row (0-13)
  seed: number;
  width: number; // cells width (6 for maze, 3 for sudoku3x3, 3 for sudoku4x4)
  height: number; // cells height (6 for maze, 3 for sudoku3x3, 3 for sudoku4x4)
}

export interface ResizableConfig {
  width: boolean;
  height: boolean;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
}

export interface PuzzleDefinition {
  type: PuzzleType;
  width: number;
  height: number;
  label: string;
  resizable?: ResizableConfig;
}

export const GRID_COLS = 10;
export const GRID_ROWS = 14;
export const CELL_SIZE_MM = 19;

export const PUZZLE_DEFINITIONS: PuzzleDefinition[] = [
  {
    type: 'maze',
    width: 4,
    height: 4,
    label: 'Maze (4×4)',
    resizable: {
      width: true,
      height: true,
      minWidth: 4,
      maxWidth: GRID_COLS,
      minHeight: 4,
      maxHeight: GRID_ROWS,
    },
  },
  { type: 'sudoku3x3', width: 3, height: 3, label: 'Sudoku (3×3)' },
  { type: 'sudoku4x4', width: 3, height: 3, label: 'Sudoku (4×4)' },
  { type: 'whichdoesntbelong', width: 4, height: 1, label: "Which Doesn't Belong?" },
];

/**
 * Calculate maze grid dimensions from allocated grid cells
 * Formula: 2:1 ratio with margins
 * - Horizontal: 1 maze cell margin on each side (2 total)
 * - Vertical: 1.5 maze cells at top + 0.5 at bottom (2 total)
 *
 * Examples:
 * - 4x4 grid cells → 6x6 maze
 * - 5x5 grid cells → 8x8 maze
 */
export function getMazeDimensions(gridWidth: number, gridHeight: number): { width: number; height: number } {
  return {
    width: gridWidth * 2 - 2,
    height: gridHeight * 2 - 2,
  };
}

/**
 * Get puzzle definition by type
 */
export function getPuzzleDefinition(type: PuzzleType): PuzzleDefinition | undefined {
  return PUZZLE_DEFINITIONS.find(def => def.type === type);
}
