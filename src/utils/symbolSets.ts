export type SudokuMode = 'colours' | 'shapes' | 'characters';

export interface SudokuConfig {
  mode: SudokuMode;
  characters?: [string, string, string, string];
}

export const COLOURS = ['red', 'green', 'blue', 'yellow'] as const;
export const SHAPES = ['circle', 'square', 'triangle', 'cross'] as const;

/**
 * Get the symbols for a given sudoku configuration
 */
export function getSymbols(config: SudokuConfig): [string, string, string, string] {
  switch (config.mode) {
    case 'colours':
      return ['red', 'green', 'blue', 'yellow'];
    case 'shapes':
      return ['circle', 'square', 'triangle', 'cross'];
    case 'characters':
      return config.characters || ['A', 'B', 'C', 'D'];
  }
}

/**
 * Get display name for the mode
 */
export function getModeName(config: SudokuConfig): string {
  switch (config.mode) {
    case 'colours':
      return 'colour';
    case 'shapes':
      return 'shape';
    case 'characters':
      return 'character';
  }
}
