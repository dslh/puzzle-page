import type { PuzzleDefinition } from '../../../types/puzzle';
import Sudoku, { type SudokuConfig } from './index';
import SudokuConfigBar from './SudokuConfigBar';

export const puzzleDefinition: PuzzleDefinition<SudokuConfig> = {
  type: 'sudoku',
  label: 'Sudoku',
  icon: '🔢',
  component: Sudoku,
  configComponent: SudokuConfigBar,
  defaultWidth: 3,
  defaultHeight: 3,
  defaultConfig: {
    size: 3,
    symbolType: 'colors',
  },
};
