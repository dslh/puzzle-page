import type { PuzzleDefinition } from '../../../types/puzzle';
import type { PuzzleMazeConfig } from './index';
import PuzzleMaze from './index';
import PuzzleMazeConfigBar from './PuzzleMazeConfigBar';

export const puzzleDefinition: PuzzleDefinition<PuzzleMazeConfig> = {
  type: 'puzzlemaze',
  label: 'Puzzle Maze',
  icon: '🎯',
  component: PuzzleMaze,
  defaultWidth: 4,
  defaultHeight: 4,
  resizable: {
    width: true,
    height: true,
    minWidth: 3,
    maxWidth: 8,
    minHeight: 3,
    maxHeight: 10,
  },
  configComponent: PuzzleMazeConfigBar,
  defaultConfig: {
    emojiMode: 'random',
  },
};
