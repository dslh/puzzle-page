import type { PuzzleDefinition } from '../../../types/puzzle';
import { GRID_COLS, GRID_ROWS } from '../../../types/puzzle';
import WeavingMaze, { type WeavingMazeConfig } from './index';
import WeavingMazeConfigBar from './WeavingMazeConfigBar';

export const puzzleDefinition: PuzzleDefinition<WeavingMazeConfig> = {
  type: 'weavingmaze',
  label: 'Weaving Maze',
  icon: '🪢',
  category: 'mazes',
  ages: ['4-5', '6-7'],
  component: WeavingMaze,
  docs: () => import('./docs'),
  configComponent: WeavingMazeConfigBar,
  defaultWidth: 5,
  defaultHeight: 5,
  defaultConfig: {
    cellSizeRatio: 2,
    crossingDensity: 'medium',
    branchiness: 'medium',
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
