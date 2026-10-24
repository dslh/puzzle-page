import type React from 'react';
import type { PuzzleDoc } from './puzzleDoc';

export type PuzzleType = 'maze'
                       | 'weavingmaze'
                       | 'sudoku'
                       | 'whichdoesntbelong'
                       | 'patternsequence'
                       | 'matching'
                       | 'picturescramble'
                       | 'wordsearch'
                       | 'lasermaze'
                       | 'oddoneout'
                       | 'whichisthesame'
                       | 'counting'
                       | 'ordering'
                       | 'chess'
                       | 'puzzlemaze'
                       | 'handwriting'
                       | 'coloursightword'
                       | 'letterformation'
                       | 'sums'
                       | 'takeaway'
                       | 'moreorless'
                       | 'initialsounds'
                       | 'directions'
                       | 'secretcode'
                       | 'prewriting'
                       | 'dotmarker'
                       | 'missingnumbers';

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

/**
 * Standard props interface for puzzle config components.
 * All configComponent implementations must follow this interface.
 */
export interface PuzzleConfigProps<TConfig> {
  value: TConfig;
  onChange: (config: TConfig) => void;
}

/**
 * Sidebar groups, in display order.
 */
export const PUZZLE_CATEGORIES = [
  { id: 'mazes', label: 'Mazes & Paths' },
  { id: 'reading', label: 'Reading & Phonics' },
  { id: 'writing', label: 'Writing' },
  { id: 'numbers', label: 'Numbers' },
  { id: 'thinking', label: 'Thinking & Logic' },
] as const;

export type PuzzleCategory = typeof PUZZLE_CATEGORIES[number]['id'];

/**
 * Age bands for the sidebar's age switch, youngest first. 'all' shows every
 * entry with its base config.
 */
export const AGE_BANDS = [
  { id: '2-3', label: '2–3' },
  { id: '4-5', label: '4–5' },
  { id: '6-7', label: '6–7' },
] as const;

export type AgeBand = typeof AGE_BANDS[number]['id'];
export type AgeSetting = AgeBand | 'all';

/**
 * Per-band config changes, merged over the base config when that band is
 * selected. Only list what differs; most puzzles need none.
 */
export type AgeConfig<TConfig> = Partial<Record<AgeBand, Partial<TConfig>>>;

/**
 * An extra sidebar entry for a puzzle: the same puzzle under another name,
 * usually in another category, starting from different settings.
 */
export interface PuzzlePreset<TConfig = unknown> {
  id: string;                // Unique within the puzzle
  label: string;
  icon?: string;             // Defaults to the puzzle's icon
  category: PuzzleCategory;
  config: Partial<TConfig>;  // Merged over defaultConfig
  ages?: AgeBand[];          // Defaults to the puzzle's ages
  ageConfig?: AgeConfig<TConfig>;
}

export interface PuzzleDefinition<TConfig = unknown> {
  type: PuzzleType;
  label: string;
  icon: string;
  category: PuzzleCategory;
  component: React.ComponentType<PuzzleProps<TConfig>>;
  defaultWidth: number;
  defaultHeight: number;
  resizable?: ResizableConfig;
  configComponent?: React.ComponentType<PuzzleConfigProps<TConfig>>;
  defaultConfig?: TConfig;
  presets?: PuzzlePreset<TConfig>[];
  ages?: AgeBand[];          // Bands the sidebar lists it under; all if absent
  ageConfig?: AgeConfig<TConfig>;
  /** The help page, loaded when it is opened: `() => import('./docs')` */
  docs?: () => Promise<{ default: PuzzleDoc<TConfig> }>;
}

export const GRID_COLS = 10;
export const GRID_ROWS = 14;
export const CELL_SIZE_MM = 19;
