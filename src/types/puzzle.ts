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
                       | 'whichwaydiditturn'
                       | 'counting'
                       | 'ordering'
                       | 'chessmoves'
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
                       | 'missingnumbers'
                       | 'lifecycles'
                       | 'whogoeswhere'
                       | 'drawtheotherhalf'
                       | 'spotthedifference';

export interface PlacedPuzzle {
  id: string;
  type: PuzzleType;
  x: number; // grid column (0-9)
  y: number; // grid row (0-13)
  seed: number;
  width: number; // cells width (6 for maze, 3 for sudoku3x3, 3 for sudoku4x4)
  height: number; // cells height (6 for maze, 3 for sudoku3x3, 3 for sudoku4x4)
  config?: unknown; // Puzzle-specific configuration (e.g., sudoku size)
  entry?: string; // The sidebar entry it came from, e.g. 'matching:words'
  /**
   * A filler: covers the whole page, behind the other puzzles, and draws
   * itself in whatever space they leave (`freeRegion`). Other puzzles never
   * collide with it, and it is never moved or resized. One per page at most.
   */
  fill?: true;
}

/**
 * Standard props interface for all puzzle components
 */
export interface PuzzleProps<TConfig = unknown> {
  gridWidth: number;   // Grid cells allocated (width)
  gridHeight: number;  // Grid cells allocated (height)
  seed: number;        // For deterministic generation
  config?: TConfig;    // Optional puzzle-specific configuration
  /** Presentation only: never changes the generated puzzle or saved config. */
  showAnswers?: boolean;
  /**
   * For a filler, the squares of the page it may use (see `freeRegion`). The
   * filler is given the whole page, so gridWidth × gridHeight is the page.
   */
  region?: string;
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
  /** Configuring a filler, so options that make no sense in a gap can go. */
  fill?: boolean;
}

/**
 * Sidebar groups, in display order.
 */
export const PUZZLE_CATEGORIES = [
  { id: 'mazes', label: 'Mazes & Paths' },
  { id: 'reading', label: 'Reading & Phonics' },
  { id: 'writing', label: 'Writing' },
  { id: 'numbers', label: 'Numbers' },
  { id: 'science', label: 'Science & Nature' },
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
  defaultWidth?: number;     // Default to the puzzle's
  defaultHeight?: number;
  ages?: AgeBand[];          // Defaults to the puzzle's ages
  ageConfig?: AgeConfig<TConfig>;
  /**
   * A filler (see `PlacedPuzzle.fill`): listed under Fill the gaps rather than
   * in its category, and its component must draw inside `region`.
   */
  fill?: boolean;
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
