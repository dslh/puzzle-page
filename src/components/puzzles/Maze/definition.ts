import type { PuzzleDefinition } from '../../../types/puzzle';
import { GRID_COLS, GRID_ROWS } from '../../../types/puzzle';
import Maze from './index';

export const puzzleDefinition: PuzzleDefinition = {
  type: 'maze',
  label: 'Maze (4×4)',
  icon: '🧩',
  component: Maze,
  defaultWidth: 4,
  defaultHeight: 4,
  resizable: {
    width: true,
    height: true,
    minWidth: 4,
    maxWidth: GRID_COLS,
    minHeight: 4,
    maxHeight: GRID_ROWS,
  },
};
