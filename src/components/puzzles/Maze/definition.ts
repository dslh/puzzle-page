import type { PuzzleDefinition } from '../../../types/puzzle';
import { GRID_COLS, GRID_ROWS } from '../../../types/puzzle';
import Maze, { type MazeConfig } from './index';
import MazeConfigBar from './MazeConfigBar';

export const puzzleDefinition: PuzzleDefinition<MazeConfig> = {
  type: 'maze',
  label: 'Maze (4×4)',
  icon: '🧩',
  component: Maze,
  configComponent: MazeConfigBar,
  defaultWidth: 4,
  defaultHeight: 4,
  defaultConfig: {
    gridShape: 'square',
    cellSizeRatio: 2,
    branchiness: 'medium',
    theme: 'random',
    curvyWalls: false,
  },
  resizable: {
    width: true,
    height: true,
    minWidth: 4,
    maxWidth: GRID_COLS,
    minHeight: 4,
    maxHeight: GRID_ROWS,
  },
};
