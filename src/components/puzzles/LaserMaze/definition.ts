import type { PuzzleDefinition } from '../../../types/puzzle';
import { GRID_COLS, GRID_ROWS } from '../../../types/puzzle';
import LaserMaze from './index';

export const puzzleDefinition: PuzzleDefinition = {
  type: 'lasermaze',
  label: 'Laser Maze',
  icon: '🔦',
  component: LaserMaze,
  defaultWidth: 5,
  defaultHeight: 5,
  resizable: {
    width: true,
    height: true,
    minWidth: 4,
    maxWidth: GRID_COLS,
    minHeight: 4,
    maxHeight: GRID_ROWS,
  },
};
