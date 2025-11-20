import type { PuzzleDefinition } from '../../../types/puzzle';
import Sudoku, { type SudokuConfig } from './index';
import SudokuConfigBar from './SudokuConfigBar';

export const puzzleDefinition: PuzzleDefinition<SudokuConfig> = {
  type: 'sudoku3x3',
  label: 'Sudoku (3×3)',
  icon: '🔢',
  component: Sudoku,
  configComponent: SudokuConfigBar,
  defaultWidth: 3,
  defaultHeight: 3,
  defaultConfig: {
    size: 3,
  },
};
