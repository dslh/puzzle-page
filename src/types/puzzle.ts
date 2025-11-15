export type PuzzleType = 'maze' | 'sudoku3x3' | 'sudoku4x4';

export interface PlacedPuzzle {
  id: string;
  type: PuzzleType;
  x: number; // grid column (0-9)
  y: number; // grid row (0-13)
  seed: number;
  width: number; // cells width (6 for maze, 3 for sudoku3x3, 3 for sudoku4x4)
  height: number; // cells height (6 for maze, 3 for sudoku3x3, 3 for sudoku4x4)
}

export interface PuzzleDefinition {
  type: PuzzleType;
  width: number;
  height: number;
  label: string;
}

export const PUZZLE_DEFINITIONS: PuzzleDefinition[] = [
  { type: 'maze', width: 4, height: 4, label: 'Maze (4×4)' },
  { type: 'sudoku3x3', width: 3, height: 3, label: 'Sudoku (3×3)' },
  { type: 'sudoku4x4', width: 3, height: 3, label: 'Sudoku (4×4)' },
];

export const GRID_COLS = 10;
export const GRID_ROWS = 14;
export const CELL_SIZE_MM = 19;
