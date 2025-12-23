import type React from 'react';

export type PuzzleType = 'maze'
                       | 'sudoku'
                       | 'whichdoesntbelong'
                       | 'patternsequence'
                       | 'matching'
                       | 'picturescramble'
                       | 'wordsearch';

export interface PlacedPuzzle {
  id: string;
  type: PuzzleType;
  x: number; // grid column (0-9)
  y: number; // grid row (0-13)
  seed: number;
  width: number; // cells width (6 for maze, 3 for sudoku3x3, 3 for sudoku4x4)
  height: number; // cells height (6 for maze, 3 for sudoku3x3, 3 for sudoku4x4)
  config?: unknown; // Puzzle-specific configuration (e.g., sudoku size)
}

/**
 * Standard props interface for all puzzle components
 */
export interface PuzzleProps<TConfig = unknown> {
  gridWidth: number;   // Grid cells allocated (width)
  gridHeight: number;  // Grid cells allocated (height)
  seed: number;        // For deterministic generation
  config?: TConfig;    // Optional puzzle-specific configuration
}

export interface ResizableConfig {
  width: boolean;
  height: boolean;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
}

export interface PuzzleDefinition<TConfig = unknown> {
  type: PuzzleType;
  label: string;
  icon: string;
  component: React.ComponentType<PuzzleProps<TConfig>>;
  defaultWidth: number;
  defaultHeight: number;
  resizable?: ResizableConfig;
  configComponent?: React.ComponentType<any>; // For future configuration UI
  defaultConfig?: TConfig; // For future default configuration
}

export const GRID_COLS = 10;
export const GRID_ROWS = 14;
export const CELL_SIZE_MM = 19;
