export type PuzzleType = 'maze' | 'sudoku';

export interface PlacedPuzzle {
  id: string;
  type: PuzzleType;
  x: number; // grid column (0-9)
  y: number; // grid row (0-13)
  seed: number;
  width: number; // cells width (6 for maze, 4 for sudoku)
  height: number; // cells height (6 for maze, 4 for sudoku)
}

export interface PuzzleDefinition {
  type: PuzzleType;
  width: number;
  height: number;
  label: string;
}

export const PUZZLE_DEFINITIONS: PuzzleDefinition[] = [
  { type: 'maze', width: 6, height: 6, label: 'Maze (6×6)' },
  { type: 'sudoku', width: 4, height: 4, label: 'Sudoku (4×4)' },
];

export const GRID_COLS = 10;
export const GRID_ROWS = 14;
export const CELL_SIZE_MM = 19;
