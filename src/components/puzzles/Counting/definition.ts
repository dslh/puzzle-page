import type { PuzzleDefinition } from '../../../types/puzzle';
import { GRID_COLS, GRID_ROWS } from '../../../types/puzzle';
import Counting from './index';

export const puzzleDefinition: PuzzleDefinition = {
  type: 'counting',
  label: 'Counting',
  icon: '🔢',
  category: 'numbers',
  ages: ['4-5', '6-7'],
  component: Counting,
  defaultWidth: 4,
  defaultHeight: 3,
  resizable: {
    width: true,
    height: true,
    minWidth: 3,
    maxWidth: GRID_COLS,
    minHeight: 1,
    maxHeight: GRID_ROWS,
  },
};
