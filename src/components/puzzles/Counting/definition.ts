import type { PuzzleDefinition } from '../../../types/puzzle';
import { GRID_COLS, GRID_ROWS } from '../../../types/puzzle';
import Counting from './index';

export const puzzleDefinition: PuzzleDefinition = {
  type: 'counting',
  label: 'Counting',
  icon: '🔢',
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
